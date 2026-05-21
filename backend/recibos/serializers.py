from rest_framework import serializers
from .models import Recibo

class ReciboSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recibo
        fields = "__all__"