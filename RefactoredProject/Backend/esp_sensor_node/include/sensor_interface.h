#pragma once
#include "sensor_data.h"

typedef struct
{
    void (*init)();
    void (*update)();
    void (*read)(SensorData& data);
} SensorInterface;
