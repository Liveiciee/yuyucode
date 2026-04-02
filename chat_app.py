from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, TextArea, Input, RichLog
from textual.containers import Vertical, VerticalScroll
from textual.message import Message
from textual.reactive import reactive

class ChatApp(App):
    """Aplikasi chat sederhana dengan input di bawah, chat log di atas."""
    
    CSS = """
    #chat-log {
        height: 100%;
        border: solid $primary;
        background: $surface;
    }
    #input-area {
        height: 3;
        border-top: solid $primary;
    }
    Input {
        width: 100%;
    }
    """

    def compose(self) -> ComposeResult:
        yield Header()
        with Vertical():
            # Area chat yang bisa discroll
            self.chat_log = RichLog(id="chat-log", markup=True)
            yield self.chat_log
            # Area input
            self.input = Input(placeholder="Ketik pesan...", id="input-area")
            yield self.input
        yield Footer()

    def on_input_submitted(self, event: Input.Submitted) -> None:
        """Saat user tekan Enter (atau tap submit di keyboard HP)."""
        pesan = event.value
        if pesan.strip():
            # Tambahkan pesan ke chat log
            self.chat_log.write(f"[bold blue]Kamu:[/] {pesan}")
            # Simulasi respon AI (bisa diganti dengan API atau logika)
            self.chat_log.write(f"[green]AI:[/] Terima kasih sudah chat!")
            # Kosongkan input
            self.input.value = ""

if __name__ == "__main__":
    app = ChatApp()
    app.run()
