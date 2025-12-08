#include <SimpleDHT.h>
#include "pin_config.h"
#include "sensor_interface.h"
#include "sensor_data.h"

static SimpleDHT11 dht11;

static void dht_init() {}

static void dht_update() {}

static void dht_read(SensorData& data) {    
    byte temperature = 0;
    byte humidity = 0;

    int err = dht11.read(PIN_DHT, &temperature, &humidity, NULL);

    if(err != SimpleDHTErrSuccess) {
        data.status_flags |= (1 << 1); // Bit 1 = DHT-Error
        return;
    }

    data.temperature = (int16_t)temperature * 10;
    data.humidity = humidity;
}

SensorInterface DHT11Sensor = {
    .init = dht_init,
    .update = dht_update,
    .read = dht_read
};
