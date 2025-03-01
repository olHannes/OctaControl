import smbus
import time

BH1750_Address = 0x23

def initBH1750(bus):
    bus.write_byte(BH1750_Address, 0x01)
    time.sleep(0.1)
    bus.write_byte(BH1750_Address, 0x10)
    time.sleep(0.2)

def getLux(bus):
    data = bus.read_i2c_block_data(BH1750_Address, 0, 2)
    lux = (data[0] << 8) | data[1]
    lux = lux / 1.2

    return lux


bus = smbus.SMBus(1)
initBH1750(bus)

while True:
    try:
        lux_value = getLux(bus)
        print(f"Lux: {lux_value}")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(2)
