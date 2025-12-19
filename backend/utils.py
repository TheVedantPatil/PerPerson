import random
import string

# Generates a unique random user ID eg ABC123
def generate_user_id():
    letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    numbers = ''.join(random.choices(string.digits, k=3))
    return letters + numbers

# Generates a unique code for groups joining eg ABCXYZ
def generate_group_code():
    return ''.join(random.choices(string.ascii_uppercase, k=6))
