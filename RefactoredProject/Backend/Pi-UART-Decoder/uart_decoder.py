import serial
import struct

START_BYTE = 0xAA

CLEAR = "\033[2J"
HOME = "\033[H"

def crc16(data: bytes):
    crc = 0xFFFF
    for byte in data:
        crc ^= byte
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xA001
            else:
                crc >>= 1
    return crc

ser = serial.Serial("COM12", 115200)

print(CLEAR)

fmt = "<hhBiihBiiHHBBBBBB"
payload_size = struct.calcsize(fmt)

while True:
    # Wait for start
    byte = ser.read(1)
    if byte[0] != START_BYTE:
        continue

    length = ser.read(1)[0]
    cmd = ser.read(1)[0]

    payload = ser.read(length - 1)   # CMD already consumed
    crc_lo = ser.read(1)[0]
    crc_hi = ser.read(1)[0]
    crc_recv = crc_lo | (crc_hi << 8)

    # CRC verify
    crc_data = bytes([length, cmd]) + payload
    crc_calc = crc16(crc_data)

    if crc_calc != crc_recv:
        print("CRC MISMATCH")
        continue

    # Unpack the full SensorData struct
    brightness, temperature, humidity, \
    lat, lon, speed, sats, \
    altitude, accuracy, heading, \
    year, month, day, hour, minute, second, \
    flags = struct.unpack(fmt, payload)

    print(HOME)
    print("---- SENSOR DATA ----")
    print(f"Brightness   : {brightness/10:.1f} lux")
    print(f"Temperature  : {temperature/10:.1f} °C")
    print(f"Humidity     : {humidity} %")

    print(f"Latitude     : {lat/1e6:.6f}")
    print(f"Longitude    : {lon/1e6:.6f}")
    print(f"Speed        : {speed/10:.1f} km/h")
    print(f"Satellites   : {sats}")

    print(f"Altitude     : {altitude/100:.2f} m")
    print(f"Accuracy     : {accuracy/100:.2f} m")
    print(f"Heading      : {heading/10:.1f}°")

    print(f"Time         : {year:04d}-{month:02d}-{day:02d} "
          f"{hour:02d}:{minute:02d}:{second:02d}")

    print(f"Flags        : 0b{flags:08b}")
    print()
