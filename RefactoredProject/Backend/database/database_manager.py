from pymongo import MongoClient
from pymongo.errors import PyMongoError
import datetime

class DatabaseManager:
    def __init__(self, uri="mongodb://localhost:27017", db_name="octa_control"):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        print(f"[DatabaseManager] Verbunden mit MongoDB @ {uri} → {db_name}")

    def save(self, collection_name, key, value):
        try:
            collection = self.db[collection_name]
            result = collection.update_one(
                {"_id": key},
                {"$set": {"value": value, "updated_at": datetime.datetime.utcnow()}},
                upsert=True
            )
            return {"status": "success", "modified": result.modified_count}
        except PyMongoError as e:
            return {"status": "error", "message": str(e)}

    def load(self, collection_name, key):
        try:
            collection = self.db[collection_name]
            doc = collection.find_one({"_id": key})
            return doc["value"] if doc else None
        except PyMongoError as e:
            return {"status": "error", "message": str(e)}

    def update(self, collection_name, key, updates: dict):
        try:
            collection = self.db[collection_name]
            result = collection.update_one(
                {"_id": key},
                {"$set": updates}
            )
            return {"status": "success", "modified": result.modified_count}
        except PyMongoError as e:
            return {"status": "error", "message": str(e)}

    def delete(self, collection_name, key):
        try:
            collection = self.db[collection_name]
            result = collection.delete_one({"_id": key})
            return {"status": "success", "deleted": result.deleted_count}
        except PyMongoError as e:
            return {"status": "error", "message": str(e)}

    def list_keys(self, collection_name):
        try:
            collection = self.db[collection_name]
            return [doc["_id"] for doc in collection.find({}, {"_id": 1})]
        except PyMongoError as e:
            return {"status": "error", "message": str(e)}
