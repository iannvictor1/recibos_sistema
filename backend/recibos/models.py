from django.db import models

class Recibo(models.Model):
    FORMA_PAGAMENTO_CHOICES = [
        ("dinheiro", "Dinheiro"),
        ("pix", "Pix"),
        ("cheque", "Cheque"),
        ("transferencia", "Transferência/Depósito"),
        ("cartao", "Cartão de Crédito/Débito"),
        ("boleto", "Boleto"),
    ]

    valor = models.DecimalField(max_digits=10, decimal_places=2)
    pagador = models.CharField(max_length=255)
    cpf_cnpj_pagador = models.CharField(max_length=20, blank=True, null=True)
    referente = models.TextField()
    emissor = models.CharField(max_length=255)
    cpf_cnpj_emissor = models.CharField(max_length=20, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    cidade = models.CharField(max_length=100)
    data_pagamento = models.DateField()
    forma_pagamento = models.CharField(
        max_length=30,
        choices=FORMA_PAGAMENTO_CHOICES,
        default="dinheiro"
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    chave_pix = models.CharField(max_length=255, blank=True, null=True)
    banco_pix = models.CharField(max_length=255, blank=True, null=True)
    recebedor_pix = models.CharField(max_length=255, blank=True, null=True)

    numero_cheque = models.CharField(max_length=255, blank=True, null=True)
    agencia_cheque = models.CharField(max_length=255, blank=True, null=True)
    banco_cheque = models.CharField(max_length=255, blank=True, null=True)

    conta_transferencia = models.CharField(max_length=255, blank=True, null=True)
    agencia_transferencia = models.CharField(max_length=255, blank=True, null=True)
    banco_transferencia = models.CharField(max_length=255, blank=True, null=True)
    favorecido_transferencia = models.CharField(max_length=255, blank=True, null=True)

    banco_boleto = models.CharField(max_length=255, blank=True, null=True)
    numero_boleto = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"Recibo de {self.pagador} - R$ {self.valor}"