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

Napi::Value GetCursorState(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!display) {
    return Napi::String::New(env, "arrow");
  }

  XEvent event;
  std::string cursor_name = "";

  while (XPending(display)) {
    XNextEvent(display, &event);
    if (event.type == xfixes_event_base + XFixesCursorNotify) {
      XFixesCursorNotifyEvent* cursor_event = (XFixesCursorNotifyEvent*)&event;
      last_cursor_serial = cursor_event->cursor_serial;
    }
  }

  XFixesCursorImage* cursor_image = XFixesGetCursorImage(display);
  if (cursor_image) {
    if (cursor_image->name && strlen(cursor_image->name) > 0) {
      cursor_name = cursor_image->name;
    }
    XFree(cursor_image);
  }

  if (cursor_name.empty()) {
    return Napi::String::New(env, "left_ptr");
  }

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
