#include <Wire.h>
#include <BH1750.h>
#include "pin_config.h"
#include "sensor_interface.h"
#include "sensor_data.h"

static BH1750 lightMeter;

static void bh1750_init() {
#ifdef BOARD_NANO
    Wire.begin();
#else
    Wire.begin(PIN_SDA, PIN_SCL);
#endif //BOARD_NANO
    lightMeter.begin(BH1750::CONTINUOUS_LOW_RES_MODE);
}

static void bh1750_update() {}


static void bh1750_read(SensorData& data) {
    float lux = lightMeter.readLightLevel();

    if(lux < 0) {
        data.status_flags |= (1 << 0); // Bit 0 = BH1750 error
        return;
    }
    data.status_flags &= ~(1 << 0);
    data.brightness = (int16_t)(lux * 10.0f);
}

SensorInterface BH1750Sensor = {
    .init = bh1750_init,
    .update = bh1750_update,
    .read = bh1750_read
};
