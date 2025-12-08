#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>
#include "pin_config.h"
#include "sensor_interface.h"
#include "sensor_data.h"

static SoftwareSerial gpsSerial(PIN_GPS_RX, PIN_GPS_TX);
static TinyGPSPlus gps;

// Filter-Zwischenwerte
static float filtered_speed = 0;
static float filtered_alt = 0;
static float filtered_heading = 0;
static uint8_t last_sat = 0;

static void gps_init() {
    gpsSerial.begin(9600);
}

static void gps_update() {
    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
    }
}

static void gps_read(SensorData& data) {

    if (!gps.location.isValid() || gps.location.age() > 5000) {
        data.status_flags |= (1 << 2);
        return;
    }

    data.status_flags &= ~(1 << 2);

    // --- Position ---
    data.gps_lat = (int32_t)(gps.location.lat() * 1e6);
    data.gps_lon = (int32_t)(gps.location.lng() * 1e6);

    // --- Speed ---
    if (gps.speed.isValid()) {
        float raw = gps.speed.kmph();
        if (raw < 2.0f) raw = 0.0f;

        filtered_speed = filtered_speed * 0.8f + raw * 0.2f;
        data.gps_speed = (int16_t)(filtered_speed * 10);
    }

    // --- Satellites ---
    if (gps.satellites.isValid() && gps.satellites.age() < 1500) {
        uint16_t raw = gps.satellites.value();
        if (raw <= 20) {
            last_sat = raw;
        }
        data.gps_satellites = last_sat;
    }

    // --- Altitude ---
    if (gps.altitude.isValid()) {
        float alt = gps.altitude.meters();
        filtered_alt = filtered_alt * 0.9f + alt * 0.1f;
        data.gps_altitude = (int32_t)(filtered_alt * 100);
    }

    // --- Accuracy ---
    if (gps.hdop.isValid()) {
        float hdop = gps.hdop.value() / 100.0f;
        float horiz = hdop * 5.0f;
        float vert  = hdop * 7.5f;
        float combined = (horiz + vert) / 2.0f;
        data.gps_accuracy = (int32_t)(combined * 100);
    }

    // --- Heading ---
    if (gps.course.isValid()) {
        float h = gps.course.deg();
        filtered_heading = filtered_heading * 0.8f + h * 0.2f;
        data.gps_heading = (uint16_t)(filtered_heading * 10);
    }

    // --- Time ---
    data.gps_year   = gps.date.year();
    data.gps_month  = gps.date.month();
    data.gps_day    = gps.date.day();
    data.gps_hour   = gps.time.hour();
    data.gps_minute = gps.time.minute();
    data.gps_second = gps.time.second();
}

SensorInterface GTU7Sensor = {
    .init = gps_init,
    .update = gps_update,
    .read = gps_read
};
