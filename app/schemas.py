from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    price: float
    category_id: int

class Product(ProductBase):
    id: int
    category: Optional[Category]

    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    order_id: int
    product_id: int
    quantity: int

class OrderItem(OrderItemBase):
    id: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    user_id: int
    status: str = "pending"

class Order(OrderBase):
    id: int
    user: Optional[User]
    items: List[OrderItem] = []  # список объектов OrderItem

    class Config:
        from_attributes = True


# Схема для входных данных логина
class LoginSchema(BaseModel):
    username: str
    password: str