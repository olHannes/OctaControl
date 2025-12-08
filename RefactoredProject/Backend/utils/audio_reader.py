import time
import threading
import json
import os

from .Logger import Logger
from .media_player import *
import config

log = Logger()
TAG = "AudioReader"

if config.USE_SOCKETS:
    from extension import socketio


reader_thread = None
stop_event = threading.Event()


def update_data():
    response = {
        "playback": get_playback_status(),
        "device": get_device_info(),
        "metadata": get_metadata(),
    }
    if config.USE_SOCKETS:
        socketio.emit("audio_update", response)
    return response


def audio_worker():
    log.verbose(TAG, "audio worker has been started")

    while not stop_event.is_set():
        try:
            update_data()
        except Exception as e:
            log.error(f"failed to get data: {e}")

        time.sleep(config.AUDIO["UPDATE_INTERVAL"])
    log.verbose(TAG, "audio worker has been stopped")


def start():
    global reader_thread
    if reader_thread is None or not reader_thread.is_alive():
        stop_event.clear()
        reader_thread = threading.Thread(target=audio_worker, daemon=True)
        reader_thread.start()
        return "Reader starts"
    else:
        log.verbose(TAG, "Reader thread is already active")
        return "Reader is already active"


def stop():
    global reader_thread
    stop_event.set()
    if reader_thread is not None:
        reader_thread.join(timeout=2)
        reader_thread = None