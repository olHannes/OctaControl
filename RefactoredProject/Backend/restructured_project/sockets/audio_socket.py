from services.audio_service import AudioService

def init_audio_socket(socketio):

    def loop_bt():
        while True:
            svc = AudioService.get()
            if svc.active_source == "bluetooth":
                socketio.emit("bt_audio_update", svc.read_bt())
            socketio.sleep(1)
    
    def loop_fm():
        while True:
            svc = AudioService.get()
            if svc.active_source == "radio":
                socketio.emit("fm_audio_update", svc.read_fm())
            socketio.sleep(1)

    socketio.start_background_task(loop_bt)
    socketio.start_background_task(loop_fm)
