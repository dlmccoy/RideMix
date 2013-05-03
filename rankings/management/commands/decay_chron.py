from django.core.management.base import BaseCommand

from rankings.models import GooglePlaces

class Command(BaseCommand):
  help = "Decays all values for user_rating"

  def handle(self, *args, **options):
    for place in GooglePlaces.objects.all():
      place.user_rating = 0.8 * place.user_rating
      place.save()
