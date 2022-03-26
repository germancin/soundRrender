import RPi.GPIO as GPIO
import time

print("Script started!")
# GPIO SETUP
channel = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(channel, GPIO.IN)


def callback(channel):
    if GPIO.input(channel):
        print("Sound Detected!", channel)
    else:
        print("Sound Detected!")


# let us know when the pin goes HIGH or LOW
GPIO.add_event_detect(channel, GPIO.BOTH, bouncetime=300)
# assign function to GPIO PIN, Run function on change
GPIO.add_event_callback(channel, callback)
print("Script ended!")

# infinite loop
while True:
    time.sleep(1)
