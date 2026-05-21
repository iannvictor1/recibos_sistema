from io import BytesIO
from django.http import FileResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_JUSTIFY
from .models import Recibo
from .serializers import ReciboSerializer


class ReciboViewSet(viewsets.ModelViewSet):
    queryset = Recibo.objects.all().order_by("-criado_em")
    serializer_class = ReciboSerializer

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        recibo = self.get_object()

        buffer = BytesIO()

        p = canvas.Canvas(buffer)

        p.setFont("Helvetica-Bold", 18)
        p.drawString(180, 800, "RECIBO DE PAGAMENTO")

        p.setFont("Helvetica", 12)

        styles = getSampleStyleSheet()
        style = styles["Normal"]
        style.fontName = "Helvetica"
        style.fontSize = 12
        style.leading = 18
        style.alignment = TA_JUSTIFY

        texto_recibo = f"""
        Recebi(emos) de <b>{recibo.pagador}</b>, a importância de
        <b>R$ {recibo.valor}</b>, referente à <b>{recibo.referente}</b>.
        <br/><br/>
        Para maior clareza, firmo(amos) o presente recibo, que comprova o recebimento
        integral do valor mencionado, concedendo <b>quitação plena, geral e irrevogável</b>
        pela quantia recebida.
        """

        paragrafo = Paragraph(texto_recibo, style)
        paragrafo.wrapOn(p, 500, 200)
        paragrafo.drawOn(p, 50, 650)
        
        forma_pagamento = f"""
        <b>Forma de pagamento:</b> {recibo.forma_pagamento.upper()}
        """
        
        if recibo.forma_pagamento == "pix":
            forma_pagamento += f"""
            <br/>
            <b>Recebedor:</b> {recibo.recebedor_pix}<br/>
            <b>Banco:</b> {recibo.banco_pix}<br/>
            <b>Chave PIX:</b> {recibo.chave_pix}
            """

        elif recibo.forma_pagamento == "cheque":
            forma_pagamento += f"""
            <br/>
            <b>Banco:</b> {recibo.banco_cheque}<br/>
            <b>Agência:</b> {recibo.agencia_cheque}<br/>
            <b>Número do cheque:</b> {recibo.numero_cheque}
            """

        elif recibo.forma_pagamento == "transferencia":
            forma_pagamento += f"""
            <br/>
            <b>Banco:</b> {recibo.banco_transferencia}<br/>
            <b>Agência:</b> {recibo.agencia_transferencia}<br/>
            <b>Conta:</b> {recibo.conta_transferencia}<br/>
            <b>Favorecido:</b> {recibo.favorecido_transferencia}
            """

        elif recibo.forma_pagamento == "boleto":
            forma_pagamento += f"""
            <br/>
            <b>Banco emissor:</b> {recibo.banco_boleto}<br/>
            <b>Número do boleto:</b> {recibo.numero_boleto}
            """
            
        paragrafo_pagamento = Paragraph(forma_pagamento, style)
        paragrafo_pagamento.wrapOn(p, 500, 100)
        paragrafo_pagamento.drawOn(p, 50, 560)

        p.drawString(
            350,
            620,
            f"{recibo.cidade}, {recibo.data_pagamento}"
        )

        p.line(120, 500, 470, 500)

        p.setFont("Helvetica", 14)
        p.drawCentredString(295, 480, recibo.emissor)

        p.showPage()
        p.save()

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=False,
            filename=f"recibo-{recibo.id}.pdf"
        )