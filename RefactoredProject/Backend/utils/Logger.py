import time
import sys

class Logger:
    COLORS = {
        "ENDC": "\033[0m",
        "RED": "\033[91m",
        "GREEN": "\033[92m",
        "BLUE": "\033[94m",
        "GRAY": "\033[90m"
    }

    def __init__(self):
        self.enable = True
        self.toFile = True
        self.logFile = "app.log"

    def _log(self, tag, msg, color):
        if not self.enable:
            return

        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        formatted_msg = f"{timestamp} - {tag} - {msg}"

        if self.toFile:
            try:
                with open(self.logFile, "a") as f:
                    f.write(formatted_msg + "\n")
            except Exception as e:
                print(f"Logger-Fehler: {e}", file=sys.stderr)
        else:
            colored_tag = f"{self.COLORS[color]}{tag}{self.COLORS['ENDC']}"
            print(f"{self.COLORS['GRAY']}{timestamp}{self.COLORS['ENDC']} - {colored_tag} - {msg}")

    def error(self, tag, msg):
        self._log(tag, msg, "RED")

    def debug(self, tag, msg):
        self._log(tag, msg, "BLUE")

    def verbose(self, tag, msg):
        self._log(tag, msg, "GREEN")
