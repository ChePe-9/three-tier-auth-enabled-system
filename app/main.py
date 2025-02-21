from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from . import models, schemas, crud
from .database import engine, get_db
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание всех таблиц в базе данных
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Подключение статических файлов
app.mount("/client", StaticFiles(directory="client"), name="client")

# Константы для JWT
SECRET_KEY = "q2689"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Хеширование паролей
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Генерация токена
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Аутентификация пользователя
def authenticate_user(db: Session, username: str, password: str):
    logger.info(f"Попытка аутентификации пользователя: {username}")
    user = crud.get_user_by_username(db, username)
    
    if not user:
        logger.info(f"Пользователь '{username}' не найден")
        return False
    
    logger.info(f"Хешированный пароль из БД: {user.password_hash}")
    if not pwd_context.verify(password, user.password_hash):
        logger.info(f"Неверный пароль для пользователя '{username}'")
        return False
    
    logger.info(f"Аутентификация успешна для пользователя '{username}'")
    return user

# Маршрут для отображения index.html
@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("client/index.html", "r", encoding="utf-8") as f:
        return f.read()

# Регистрация пользователя
@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    logger.info(f"Создан новый пользователь: {user.username}")
    return crud.create_user(db=db, user=user)

# Авторизация пользователя
@app.post("/auth/login", response_model=dict)
async def login_for_access_token(login_data: schemas.LoginSchema, db: Session = Depends(get_db)):
    logger.info(f"Получены данные для логина: username={login_data.username}")
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    logger.info(f"Успешная генерация токена для пользователя: {user.username}")
    return {"token": access_token, "token_type": "bearer"}

# Получение списка пользователей
@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    logger.info(f"Запрошено {len(users)} пользователей")
    return users

# Создание категории
@app.post("/categories/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(category: schemas.CategoryBase, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

# Получение списка категорий
@app.get("/categories/", response_model=list[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    logger.info(f"Запрошено {len(categories)} категорий")
    return categories

# Создание товара
@app.post("/products/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductBase, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

# Получение списка товаров
@app.get("/products/", response_model=list[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    logger.info(f"Запрошено {len(products)} товаров")
    return products

# Создание заказа
@app.post("/orders/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderBase, db: Session = Depends(get_db)):
    return crud.create_order(db=db, order=order)

# Получение списка заказов
@app.get("/orders/", response_model=list[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        orders = crud.get_orders(db, skip=skip, limit=limit)
        logger.info(f"Запрошено {len(orders)} заказов")
        return orders
    except Exception as e:
        logger.error(f"Ошибка при получении заказов: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Создание позиции заказа
@app.post("/order-items/", response_model=schemas.OrderItem, status_code=status.HTTP_201_CREATED)
def create_order_item(order_item: schemas.OrderItemBase, db: Session = Depends(get_db)):
    return crud.create_order_item(db=db, order_item=order_item)