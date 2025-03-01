import time
import RPi.GPIO as GPIO

pin = 23
GPIO.setmode(GPIO.BCM)
GPIO.setup(pin, GPIO.OUT)


while True:
	print("high")
	GPIO.output(pin, GPIO.HIGH)
	time.sleep(5)
	print("low")
	GPIO.output(pin, GPIO.LOW)
	time.sleep(3)
