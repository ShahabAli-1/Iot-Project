#include <LiquidCrystal.h>
#include <Servo.h>


const int HTTP_PORT = 80; 
const String THINGSPEAK_API_KEY = "3Q2SNPTJ5P7FQ7OL"; // From our ThingSpeak settings.
const String CHANNEL_FEED_URI = "/update?api_key=" + THINGSPEAK_API_KEY + "&field1="; // Write channel URI

// Initialize LCD and Servo Motor
LiquidCrystal lcd(2, 3, 4, 5, 6, 7);
Servo servo;
int servoPosition = 0;

// Initialize ESP8266 for internet connectivity.
String ssid = "Simulator Wifi"; // Tinkercad uses this SSID
String password = ""; // Password is not needed.
String host = "api.thingspeak.com"; 

// Define sensor pins
int ledPin = 8;
int servoPin = 9;

/*
 * Function:  bootstrapESP8266 
 * --------------------
 * Setup ESP2866 by starting a serial connection.
 * Then use the simulator SSID and password to connect to the WiFi.
 * Establish a TCP connection with ThingSpeak over HTTP.
 * This function fast-fails if any of the above steps does not result in success.
 */
int bootstrapESP8266(void) {
  // Initialize ESP2866 and serial connection.
  Serial.begin(115200);
  Serial.println("AT");
  delay(10);
    
  if (!Serial.find("OK")) return 1;  
  
  // Connect to the internet (router) using SSID and Password.
  // If successful, returns an OK message.
  Serial.println("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"");
  delay(10);
  
  if (!Serial.find("OK")) return 2;

  // Connects to the host server (ThingSpeak) as a TCP Client.
  Serial.println("AT+CIPSTART=\"TCP\",\"" + host + "\"," + HTTP_PORT);
}

/*
 * Function:  calculateMoisturePercentage 
 * --------------------
 * computes moisture value in percentage :
 *    moisturePercentage = 
 *    moisutreSensorValue / maximumMoisutreSensorValue * 100; 
 */
int calculateMoisturePercentage (int moisutreSensorValue) {
    float maximumMoisutreSensorValue = 539.00;
    return ((moisutreSensorValue / 539.00) * 100);
}

/*
 * Function:  calculateTemperatureInCentigrade 
 * --------------------
 * computes temperature in celsus:
 *      Using the the scale factor and offset, we can convert the voltage
 *      input to temperature in degree celsius. This is done by
 *      subtracting the voltage by 0.5 and multiplying by 100
 */
int calculateTemperatureInCentigrade (float temperatureSensorValue) {
  float voltage = temperatureSensorValue * 5.0;
  return (voltage / 1024.0 - 0.5) * 100;
}

/*
 * Function: isMoistureLow 
 * --------------------
 * Implements the condition for checking if moisture is too low.
 */
bool isMoistureLow(float moisturePercentage) {
    return moisturePercentage < 10.0;
}

/*
 * Function: isWaterPumpNeeded 
 * --------------------
 * Implements the condition for checking if water pump
 * needs to be turned on based on moisture and temperature values
 */
bool isWaterPumpNeeded(float moisturePercentage, float temperatureCentigrade) {
    return moisturePercentage < 10.0 || temperatureCentigrade > 35.0;
}

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  servo.attach(servoPin, 500, 2500);
  pinMode(ledPin, OUTPUT);
  bootstrapESP8266();
}

void loop() {
  // Read Sensor Values
  int moistureSensorValue = analogRead(A1);
  float temperatureSensorValue = analogRead(A0);
  
  // Conversions
  float moisturePercentage = calculateMoisturePercentage(moistureSensorValue);
  float temperatureCentigrade = calculateTemperatureInCentigrade(temperatureSensorValue);
  
  // Construct HTTP call.
  String httpPacket = "GET " + CHANNEL_FEED_URI + String(moisturePercentage) + " HTTP/1.1\r\nHost: " + host + "\r\n\r\n";
  int packetLength = httpPacket.length();
  
  // Send the data to the server. Also send the packet length.
  Serial.print("AT+CIPSEND=");
  Serial.println(packetLength);
  delay(10);
  
  Serial.print(httpPacket);
  delay(10);
  
  
  if (!Serial.find("SEND OK\r\n")) return;
  
  // show temperature and moisture values
  lcd.setCursor(0, 0);
  lcd.print("M:");
  lcd.print(moisturePercentage);
  lcd.print("%");
  lcd.print(" T:");
  lcd.print(temperatureCentigrade);
  lcd.print("C");
  
  // Turn on warning LED light if moisture is low.
  if (isMoistureLow(moisturePercentage)) {
      digitalWrite(ledPin, HIGH);
  } else {
      digitalWrite(ledPin, LOW);
  }
  
  // Turn on water pump if needed and show status.
  lcd.setCursor(0, 1);
  if (isWaterPumpNeeded(moisturePercentage, temperatureCentigrade)) {
      lcd.print("Water Pump: Yes");
      for (servoPosition = 0; servoPosition <= 90; servoPosition += 1) {
    	servo.write(servoPosition);
  	  }
  } else {
      lcd.print("Water Pump: Off");
      for (servoPosition = 90; servoPosition >= 0; servoPosition -= 1) {
    	servo.write(servoPosition);
  	  }
  }

  delay(5000);
}

// WIP.
void close() {
  // Gracefully close the connection.
  Serial.print("AT+CIPCLOSE");
  
  // Else if fails, close anyway.
  if (!Serial.find("OK")) return;
}
