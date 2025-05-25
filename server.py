from flask import Flask, request, render_template
from pymongo import MongoClient
from bson.objectid import ObjectId
import traceback

app = Flask(__name__)

client = MongoClient("mongodb+srv://kn1b21kostyniuk:k1b21@cluster0.hkvkcga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

db = client['iot_data']
collection = db['sensor_readings']

@app.route('/data', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()
        print("Отримані дані:", data)
        collection.insert_one(data)
        return {'status': 'ok'}
    except Exception as e:
        print("Помилка при обробці запиту:")
        traceback.print_exc()
        return {'status': 'error', 'message': str(e)}, 500

@app.route('/data', methods=['GET'])
def get_data():
    try:
        last_records = list(collection.find().sort('_id', -1).limit(10))
        for record in last_records:
            record['_id'] = str(record['_id'])  # Конвертуємо ObjectId у рядок для JSON
        return {'status': 'ok', 'data': last_records}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}, 500

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
