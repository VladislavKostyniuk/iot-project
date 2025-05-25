import requests
import random
import time

url = "https://iot-project-zy46.onrender.com/data"

def generate_data():
    data = {
        "device_id": "device_001",
        "temperature": round(random.uniform(20.0, 30.0), 2),
        "humidity": round(random.uniform(30.0, 70.0), 2)
    }
    return data

def send_data(data):
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print("Дані успішно відправлені:", data)
        else:
            print("Помилка відправки:", response.status_code)
    except Exception as e:
        print("Виняток при відправці:", e)

if __name__ == "__main__":
    while True:
        data = generate_data()
        send_data(data)
        time.sleep(5)
