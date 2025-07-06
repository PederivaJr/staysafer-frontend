package com.koolmind.STAY_SAFER;

import androidx.annotation.Nullable;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import android.util.Log;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;


public class NotificationServiceExtensionModule extends ReactContextBaseJavaModule {
    public static NotificationServiceExtensionModule instance;

    NotificationServiceExtensionModule(ReactApplicationContext context) {
        super(context);
        instance = this;
    }

    @Override
    public String getName() {
        return "NotificationServiceExtensionModule";
    }

    @ReactMethod
    public void createNotificationServiceExtensionEvent(String name) {
        Log.d("NotificationServiceExtensionModule", "Create event called with name: " + name);
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    public void emitNotificationEvent() {
        Log.i("OneSignalExample", "Emit Notification Event");
        WritableMap params = Arguments.createMap();
        params.putString("eventProperty", "someValue");
        sendEvent(getReactApplicationContext(), "NotificationEvent", params);
    }
}
