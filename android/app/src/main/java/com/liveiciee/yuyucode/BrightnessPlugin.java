package com.liveiciee.yuyucode;

import android.database.ContentObserver;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Brightness")
public class BrightnessPlugin extends Plugin {

    private ContentObserver brightnessObserver;

    @Override
    public void load() {
        Handler handler = new Handler(Looper.getMainLooper());
        Uri brightnessUri = Settings.System.getUriFor(Settings.System.SCREEN_BRIGHTNESS);

        brightnessObserver = new ContentObserver(handler) {
            @Override
            public void onChange(boolean selfChange) {
                emitBrightness();
            }
        };

        getContext().getContentResolver().registerContentObserver(
            brightnessUri, false, brightnessObserver
        );

        // Emit initial value on load
        emitBrightness();
    }

    @PluginMethod
    public void getBrightness(PluginCall call) {
        int raw = getBrightnessRaw();
        JSObject ret = new JSObject();
        ret.put("brightness", raw / 255.0);
        call.resolve(ret);
    }

    private void emitBrightness() {
        int raw = getBrightnessRaw();
        double normalized = raw / 255.0;
        JSObject data = new JSObject();
        data.put("brightness", normalized);
        notifyListeners("brightnessChange", data);
    }

    private int getBrightnessRaw() {
        try {
            return Settings.System.getInt(
                getContext().getContentResolver(),
                Settings.System.SCREEN_BRIGHTNESS
            );
        } catch (Settings.SettingNotFoundException e) {
            return 128; // fallback 50%
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (brightnessObserver != null) {
            getContext().getContentResolver().unregisterContentObserver(brightnessObserver);
        }
    }
}
