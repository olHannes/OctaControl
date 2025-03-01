import adafruit_dht
import board
import time

dht_device = adafruit_dht.DHT11(board.D25)

while True:
	try: 
		temp = dht_device.temperature
		hum = dht_device.humidity
		print(f"temp: {temp}, hum.: {hum} ")
	except Exception as e:
		print(f"Error: {e}")
	time.sleep(2)
