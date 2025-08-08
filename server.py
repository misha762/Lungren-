#!/usr/bin/env python3
"""
Простий HTTP сервер для тестування PWA локально
"""

import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Додаємо заголовки для PWA
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

    def do_GET(self):
        # Обробка запитів до кореневої папки
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

def get_local_ip():
    """Отримує локальну IP адресу"""
    import socket
    try:
        # Створюємо тимчасове з'єднання для отримання IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def main():
    PORT = 8000
    LOCAL_IP = get_local_ip()
    
    # Змінюємо робочу директорію на поточну
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Сервер запущено!")
        print(f"📱 Для iPhone: http://{LOCAL_IP}:{PORT}")
        print(f"💻 Для комп'ютера: http://localhost:{PORT}")
        print(f"📋 Інструкція: http://{LOCAL_IP}:{PORT}/IPHONE_INSTALL.md")
        print("\n" + "="*50)
        print("📱 ІНСТРУКЦІЯ ДЛЯ IPHONE:")
        print("1. Відкрийте Safari на iPhone")
        print(f"2. Перейдіть за адресою: http://{LOCAL_IP}:{PORT}")
        print("3. Натисніть 'Поделиться' → 'На экран «Домой»'")
        print("4. Відкрийте додаток з головного екрану")
        print("="*50)
        print("\n⏹️  Для зупинки сервера натисніть Ctrl+C")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Сервер зупинено")

if __name__ == "__main__":
    main()
