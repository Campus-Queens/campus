from django.db import models

class Chat(models.Model):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE)
    buyer = models.ForeignKey("appuser.AppUser", on_delete=models.CASCADE, related_name="buyer_chats")  
    seller = models.ForeignKey("appuser.AppUser", on_delete=models.CASCADE, related_name="seller_chats") 

    def __str__(self):
        return f"Chat on {self.listing.title} between {self.buyer.username} & {self.seller.username}"
