#include <napi.h>
#include <X11/Xlib.h>
#include <X11/Xatom.h>
#include <X11/extensions/Xfixes.h>
#include <signal.h>
#include <cstring>
#include <string>

static Display* display = nullptr;
static Window root_window = 0;
static int xfixes_event_base = 0;
static int xfixes_error_base = 0;
static bool cursor_hidden = false;
static unsigned long last_cursor_serial = 0;

static void crash_handler(int sig) {
  if (display && cursor_hidden) {
    XFixesShowCursor(display, root_window);
    XFlush(display);
    cursor_hidden = false;
  }
  signal(sig, SIG_DFL);
  raise(sig);
}

Napi::Boolean Init(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  display = XOpenDisplay(nullptr);
  if (!display) {
    Napi::Error::New(env, "Failed to open X11 display").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  root_window = DefaultRootWindow(display);

  if (!XFixesQueryExtension(display, &xfixes_event_base, &xfixes_error_base)) {
    Napi::Error::New(env, "XFixes extension not available").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  XFixesSelectCursorInput(display, root_window, XFixesDisplayCursorNotifyMask);

  signal(SIGTERM, crash_handler);
  signal(SIGINT, crash_handler);
  signal(SIGSEGV, crash_handler);
  signal(SIGABRT, crash_handler);

  return Napi::Boolean::New(env, true);
}

Napi::Object QueryPointer(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  auto result = Napi::Object::New(env);

  if (!display) {
    result.Set("x", 0);
    result.Set("y", 0);
    result.Set("buttons", 0);
    return result;
  }

  Window root_return, child_return;
  int root_x, root_y, win_x, win_y;
  unsigned int mask;

  XQueryPointer(display, root_window, &root_return, &child_return,
                &root_x, &root_y, &win_x, &win_y, &mask);

  result.Set("x", root_x);
  result.Set("y", root_y);
  result.Set("buttons", static_cast<int>(mask));
  return result;
}

static unsigned long last_checked_serial = 0;
static std::string cached_cursor_name = "left_ptr";

static std::string identify_cursor_by_image(XFixesCursorImage* img) {
  if (!img || img->width == 0 || img->height == 0)
    return "left_ptr";

  unsigned int w = img->width;
  unsigned int h = img->height;
  unsigned int hx = img->xhot;
  unsigned int hy = img->yhot;

  float ratio = (float)w / (float)h;
  bool hotspot_center = (hx > w/3 && hx < w*2/3 && hy > h/3 && hy < h*2/3);
  bool hotspot_topleft = (hx < w/3 && hy < h/3);

  // Count non-transparent pixels and their distribution
  int total_pixels = 0;
  int left_pixels = 0, right_pixels = 0, top_pixels = 0, bottom_pixels = 0;
  int center_col_pixels = 0;
  for (unsigned int y = 0; y < h; y++) {
    for (unsigned int x = 0; x < w; x++) {
      unsigned long pixel = img->pixels[y * w + x];
      unsigned int alpha = (pixel >> 24) & 0xFF;
      if (alpha > 128) {
        total_pixels++;
        if (x < w/2) left_pixels++; else right_pixels++;
        if (y < h/2) top_pixels++; else bottom_pixels++;
        if (x >= w/3 && x < w*2/3) center_col_pixels++;
      }
    }
  }

  if (total_pixels < 5) return "left_ptr";

  float fill = (float)total_pixels / (float)(w * h);
  float h_balance = (right_pixels > 0) ? (float)left_pixels / right_pixels : 10.0f;
  float v_balance = (bottom_pixels > 0) ? (float)top_pixels / bottom_pixels : 10.0f;
  float center_h_ratio = (float)center_col_pixels / total_pixels;

  // I-beam / text cursor: center hotspot, low fill, pixels concentrated in center column
  if (hotspot_center && fill < 0.25f && center_h_ratio > 0.55f) {
    return "xterm";
  }

  // Crosshair: roughly square, center hotspot, low fill
  if (ratio > 0.8f && ratio < 1.2f && hotspot_center && fill < 0.12f) {
    return "crosshair";
  }

  // Hand / pointer: hotspot near top, wider shape
  if (hy < h/3 && fill > 0.15f && fill < 0.6f && h_balance > 0.5f && h_balance < 2.0f) {
    // If hotspot is top-center-ish, likely a hand
    if (hx > w/4 && hx < w*3/4) {
      return "hand2";
    }
  }

  // Move cursor: roughly square, center hotspot, moderate fill, balanced
  if (ratio > 0.8f && ratio < 1.2f && hotspot_center && fill > 0.08f && fill < 0.4f
      && h_balance > 0.6f && h_balance < 1.5f && v_balance > 0.6f && v_balance < 1.5f) {
    return "fleur";
  }

  // Vertical resize: taller than wide, center hotspot
  if (ratio < 0.7f && hotspot_center && fill > 0.1f) {
    return "ns-resize";
  }

  // Horizontal resize: wider than tall, center hotspot
  if (ratio > 1.4f && hotspot_center && fill > 0.1f) {
    return "ew-resize";
  }

  // Not-allowed: roughly square, center hotspot, ring-like (pixels spread to edges)
  if (ratio > 0.8f && ratio < 1.2f && hotspot_center && fill > 0.1f && fill < 0.35f && center_h_ratio < 0.45f) {
    return "crossed_circle";
  }

  // Default: arrow pointer with top-left hotspot
  if (hotspot_topleft) {
    return "left_ptr";
  }

  return "left_ptr";
}

Napi::Value GetCursorState(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!display) {
    return Napi::String::New(env, "left_ptr");
  }

  XEvent event;
  while (XPending(display)) {
    XNextEvent(display, &event);
    if (event.type == xfixes_event_base + XFixesCursorNotify) {
      XFixesCursorNotifyEvent* cursor_event = (XFixesCursorNotifyEvent*)&event;
      last_cursor_serial = cursor_event->cursor_serial;
    }
  }

  XFixesCursorImage* cursor_image = XFixesGetCursorImage(display);
  if (!cursor_image) {
    return Napi::String::New(env, cached_cursor_name);
  }

  std::string cursor_name = "";
  if (cursor_image->name && strlen(cursor_image->name) > 0) {
    cursor_name = cursor_image->name;
  }

  // If name is generic (left_ptr) or empty, try to identify by image shape
  if (cursor_name.empty() || cursor_name == "left_ptr" || cursor_name == "default") {
    cursor_name = identify_cursor_by_image(cursor_image);
  }

  XFree(cursor_image);
  cached_cursor_name = cursor_name;
  return Napi::String::New(env, cursor_name);
}

Napi::Boolean HideCursor(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!display || cursor_hidden) {
    return Napi::Boolean::New(env, false);
  }

  XFixesHideCursor(display, root_window);
  XFlush(display);
  cursor_hidden = true;
  return Napi::Boolean::New(env, true);
}

Napi::Boolean ShowCursor(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!display || !cursor_hidden) {
    return Napi::Boolean::New(env, false);
  }

  XFixesShowCursor(display, root_window);
  XFlush(display);
  cursor_hidden = false;
  return Napi::Boolean::New(env, true);
}

Napi::Boolean Cleanup(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (display) {
    if (cursor_hidden) {
      XFixesShowCursor(display, root_window);
      XFlush(display);
      cursor_hidden = false;
    }
    XCloseDisplay(display);
    display = nullptr;
  }

  return Napi::Boolean::New(env, true);
}

Napi::Boolean IsCursorHidden(const Napi::CallbackInfo& info) {
  return Napi::Boolean::New(info.Env(), cursor_hidden);
}

static Window overlay_window = 0;

void SetOverlayWindow(const Napi::CallbackInfo& info) {
  if (info.Length() < 1) return;
  overlay_window = static_cast<Window>(info[0].As<Napi::Number>().Int64Value());
}

void RaiseOverlay(const Napi::CallbackInfo& info) {
  if (!display || !overlay_window) return;
  XRaiseWindow(display, overlay_window);
}

Napi::Object InitModule(Napi::Env env, Napi::Object exports) {
  exports.Set("init", Napi::Function::New(env, Init));
  exports.Set("queryPointer", Napi::Function::New(env, QueryPointer));
  exports.Set("getCursorState", Napi::Function::New(env, GetCursorState));
  exports.Set("hideCursor", Napi::Function::New(env, HideCursor));
  exports.Set("showCursor", Napi::Function::New(env, ShowCursor));
  exports.Set("cleanup", Napi::Function::New(env, Cleanup));
  exports.Set("isCursorHidden", Napi::Function::New(env, IsCursorHidden));
  exports.Set("setOverlayWindow", Napi::Function::New(env, SetOverlayWindow));
  exports.Set("raiseOverlay", Napi::Function::New(env, RaiseOverlay));
  return exports;
}

NODE_API_MODULE(x11_addon, InitModule)
