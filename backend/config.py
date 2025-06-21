from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str = "mongodb+srv://devlabs07:0rsKIrtlWd1h0Fn6@cluster0.0onzi5k.mongodb.net/"
