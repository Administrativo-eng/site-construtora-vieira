#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse da URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Se é um arquivo estático (com extensão), serve normalmente
        if '.' in os.path.basename(path) and not path.endswith('/'):
            return super().do_GET()
        
        # Lista de rotas válidas
        valid_routes = [
            '/', '/home', '/sobrenos', '/servicos', '/obras', 
            '/empreendimentos', '/sustentabilidade', '/noticias', 
            '/simulacao', '/trabalheconosco', '/contato'
        ]
        
        # Remove trailing slash
        clean_path = path.rstrip('/')
        if clean_path == '':
            clean_path = '/'
            
        # Se é uma rota válida ou uma sub-rota (como /empreendimento/1), serve o index.html
        if clean_path in valid_routes or any(clean_path.startswith(route + '/') for route in valid_routes if route != '/'):
            self.path = '/index.html'
            return super().do_GET()
        
        # Caso contrário, serve normalmente (pode dar 404)
        return super().do_GET()

if __name__ == "__main__":
    PORT = 8081
    
    # Para o servidor anterior se estiver rodando
    os.system("fuser -k 8080/tcp 2>/dev/null")
    
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Servidor rodando na porta {PORT}")
        print(f"Acesse: http://localhost:{PORT}")
        httpd.serve_forever()

