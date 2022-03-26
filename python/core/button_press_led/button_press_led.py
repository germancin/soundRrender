import RPi.GPIO as GPIO  # Use GPIO library
import time  # Use time library

GPIO.setwarnings(False)

# pin11 is connected to the led anode (+ve pin), cathode(-ve pin) connected to pin9 GND
ledPin = 11
buttonPin = 16  # pin 16 is connected to the button - other button pin is connected to gnd - pin 14
clickCounter = 0
time_clicked_off = time.time() + 1
time_clicked_on = time.time()
GPIO.setmode(GPIO.BOARD)  # Numbers GPIOs by physical location

GPIO.setup(ledPin, GPIO.OUT)  # set ledPin's mode as output
GPIO.output(ledPin, GPIO.LOW)  # initially turn off the led

# Set buttonPin as input and enable pullup resistor
GPIO.setup(buttonPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:  # Loop indefinitely
    # Button was pressed - CLICK ACTION
    GPIO.wait_for_edge(buttonPin, GPIO.FALLING)  # CLICKED PRESSS
    print("clicIN")
    GPIO.output(ledPin, GPIO.HIGH)
    GPIO.wait_for_edge(buttonPin, GPIO.RISING)  # CLICKED UN-PRESSS
    print("clicOUT")
    GPIO.output(ledPin, GPIO.LOW)

    # GPIO.output(ledPin, GPIO.HIGH)  # Turn led on - FUNCTION TO TURN THE LED ON
    # Button was released - ACTION OF BUTTON RELEASE
    # GPIO.wait_for_edge(buttonPin, GPIO.RISING)
    # GPIO.output(ledPin, GPIO.LOW)  # Turn led off

GPIO.cleanup()  # Clean up when exiting the program
