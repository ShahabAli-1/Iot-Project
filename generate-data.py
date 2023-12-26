import random
import xlsxwriter
import csv
from datetime import datetime, timedelta

def generate_soil_moisture_percentage():
  return random.randint(0, 50)

def generate_soil_moisture_data():
  soil_moisture_data = []
  # Generate data for the specified number of days
  for day in range(365):
    # Generate data for each minute of the day (1440 minutes in a day)
    for minute in range(1440):
      soil_moisture = generate_soil_moisture_percentage()
      # Get the current timestamp
      timestamp = datetime.now() - timedelta(days=day, minutes=minute)
      # Convert the timestamp to a string in the desired format
      timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
      soil_moisture_data.append((timestamp_str, soil_moisture))
  return soil_moisture_data

def write_excel(soil_moisture_data):
  workbook = xlsxwriter.Workbook('soil_moisture_data.xlsx')
  worksheet = workbook.add_worksheet()

  # Add the headers
  worksheet.write(0, 0, 'timestamp')
  worksheet.write(0, 1, 'soil_moisture')

  # Add the data
  row = 1
  for data in soil_moisture_data:
    worksheet.write(row, 0, data[0])
    worksheet.write(row, 1, data[1])
    row += 1

  workbook.close()

def write_csv(soil_moisture_data):
  with open('soil_moisture_data.csv', 'w', newline='') as csvfile:
    fieldnames = ['timestamp', 'soil_moisture']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for data in soil_moisture_data:
      writer.writerow({'timestamp': data[0], 'soil_moisture': data[1]})

soil_moisture_data = generate_soil_moisture_data()
write_excel(soil_moisture_data)
write_csv(soil_moisture_data)
