import { Component } from '@angular/core';
import { HuggingFaceService } from './hugging-face.service';


interface Mensaje {
  text: string;
  user: boolean; // true = usuario, false = bot
}

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent {
  isOpen = false; // El chat inicia abierto
  mensaje: string = '';
  mensajes: Mensaje[] = [
    { text: '¡Hola! ¿En qué podemos ayudarte hoy?', user: false }
  ];
  esperando = false;

  constructor(private hfService: HuggingFaceService) {}

  minimizarChat() {
    this.isOpen = false;
  }

  abrirChat() {
    this.isOpen = true;
  }

  toggleChat(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = !this.isOpen;
  }

  enviarMensaje() {
    if (!this.mensaje.trim()) return;
    const texto = this.mensaje;
    this.mensajes.push({ text: texto, user: true });
    this.mensaje = '';
    this.esperando = true;

    this.hfService.query(texto).subscribe({
      next: (res: any) => {
        console.log('Respuesta del servidor:', res);
        let respuesta = '';
        
        // Manejar la respuesta del nuevo backend
        if (res && res.respuesta) {
          respuesta = res.respuesta;
        } else {
          respuesta = 'Lo siento, no entendí tu mensaje.';
        }

        this.mensajes.push({ text: respuesta, user: false });
        this.esperando = false;
      },
      error: () => {
        this.mensajes.push({ text: 'Ocurrió un error al contactar con el asistente.', user: false });
        this.esperando = false;
      }
    });
  }
}