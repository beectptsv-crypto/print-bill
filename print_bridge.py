"""
Print Bridge - ຮັບ raw ESC/POS bytes ຈາກ web app ແລ້ວສົ່ງກົງໄປໃສ່ Windows printer queue.
ໃຊ້ແກ້ບັນຫາ driver ບໍ່ຮອງຮັບພາສາລາວ (ສົ່ງເປັນຮູບພາບແທນຕົວອັກສອນ).

ວິທີໃຊ້:
    pip install pywin32
    python print_bridge.py
ຄ້າງໄວ້ (ຢ່າປິດ Terminal) ໃນຂະນະທີ່ໃຊ້ web app.
"""

import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

try:
    import win32print
except ImportError:
    print("ຕ້ອງຕິດຕັ້ງ pywin32 ກ່ອນ: pip install pywin32")
    sys.exit(1)

PORT = 9200


class PrintBridgeHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def _json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/printers":
            try:
                printers = [
                    p[2]
                    for p in win32print.EnumPrinters(
                        win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
                    )
                ]
            except Exception as e:
                self._json(500, {"error": str(e)})
                return
            try:
                default_printer = win32print.GetDefaultPrinter()
            except Exception:
                default_printer = None
            self._json(200, {"printers": printers, "default": default_printer})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/print":
            self._json(404, {"error": "not found"})
            return

        qs = parse_qs(parsed.query)
        printer_name = (qs.get("printer") or [None])[0]
        if not printer_name:
            try:
                printer_name = win32print.GetDefaultPrinter()
            except Exception:
                printer_name = None

        if not printer_name:
            self._json(400, {"error": "ບໍ່ໄດ້ລະບຸຊື່ເຄື່ອງພິມ ແລະ ບໍ່ພົບເຄື່ອງພິມຄ່າເລີ່ມຕົ້ນ"})
            return

        length = int(self.headers.get("Content-Length", 0))
        raw_data = self.rfile.read(length) if length else b""

        try:
            hprinter = win32print.OpenPrinter(printer_name)
            try:
                win32print.StartDocPrinter(hprinter, 1, ("Bill Print", None, "RAW"))
                win32print.StartPagePrinter(hprinter)
                win32print.WritePrinter(hprinter, raw_data)
                win32print.EndPagePrinter(hprinter)
                win32print.EndDocPrinter(hprinter)
            finally:
                win32print.ClosePrinter(hprinter)
        except Exception as e:
            self._json(500, {"error": str(e)})
            return

        self._json(200, {"ok": True})

    def log_message(self, fmt, *args):
        print("[print_bridge]", *args)


if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", PORT), PrintBridgeHandler)
    print(f"Print bridge ກຳລັງເຮັດວຽກຢູ່ http://127.0.0.1:{PORT}")
    print("ກົດ Ctrl+C ເພື່ອຢຸດ")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nຢຸດແລ້ວ")
