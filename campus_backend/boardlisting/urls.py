from django.urls import path
from .views import BoardListingCreateView, BoardListingListView

urlpatterns = [
    path('create/', BoardListingCreateView.as_view(), name='create-post'),
    path('', BoardListingListView.as_view(), name='list-posts'),
]