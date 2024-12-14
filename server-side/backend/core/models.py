from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)  # New field
    

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


    def profile(self):
        profile = Profile.objects.get(user=self)

class Profile(models.Model):
    
    PREFERED_LANGUAGE = [
        ('AMHARIC', 'Amharic'),
        ('OROMIFA', 'Oromifa'),
        ('SOMALLI', 'Somalli'),
        ('TIGRIGNA', 'Tigrigna'),
        ('ENGLISH', 'English')
    ]

    MARTIAL_STATUS = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced')
    ]

    GENDER = [
        ('FEMALE' , 'Female'),
        ('MALE' , 'Male')
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=1000)
    last_name = models.CharField(max_length=1000)
    bio = models.CharField(max_length=1000, null= True)
    image = models.ImageField(upload_to="user_images", default="user_images/default.jpg")

    user_type = models.CharField(max_length=10, blank=True)
    prefered_language = models.CharField(max_length = 10, choices = PREFERED_LANGUAGE, default =  'English')
    age = models.IntegerField()
    gender = models.CharField(max_length = 6, choices = GENDER)
    martial_status = models.CharField(max_length = 10, choices = MARTIAL_STATUS)
    region = models.CharField(max_length =255)
    city = models.CharField(max_length = 255)
    phone = models.CharField(max_length = 20)
    publicKey = models.TextField(blank=True)
    
class Patient(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)
    EMPLOYMENT_STATUSES = [
        ('STUDENT', 'Student'),
        ('EMPLOYED', 'Employed'),
        ('SELFEMPLOYED', 'Self-Employed'),
        ('UNEMPLOYED', 'Unemployed')
    ]
    occupation = models.CharField(max_length = 13, choices = EMPLOYMENT_STATUSES)
    has_paid = models.BooleanField(default=False)
    prediction_result = models.CharField(max_length=100, default = "null")



    
class Therapist(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)
    RELIGON = [
        ('ORTHODOX', 'Orthodox'),
        ('CHATHOLIC', 'Catholic'),
        ('PROTESTANT', ' Protestant'),
        ('MUSLIM', 'Muslim'),
    ]
    specialization = models.CharField(max_length=100)
    experience = models.IntegerField()
    licenses = models.FileField(upload_to="therapist_licences")
    religion = models.CharField(max_length = 10, choices = RELIGON)
    rating = models.FloatField(default = 0.0)
    paymentRate = models.FloatField(default = 0)
    totalBalance = models.FloatField(default = 0)
    withdrawableBalance = models.FloatField(default = 0)
    is_verified = models.BooleanField(default=False) #A field to be updated after a therapist is verified by an Admin

class Feedback(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)



