from sqlalchemy.orm import Session, joinedload
from . import models, schemas
from argon2 import PasswordHasher
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем экземпляр PasswordHasher для хеширования паролей
ph = PasswordHasher()

def get_user_by_username(db: Session, username: str):
    """
    Получить пользователя по имени пользователя.
    """
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        logger.info(f"Попытка получить пользователя: {username}")
        if not user:
            logger.info(f"Пользователь '{username}' не найден")
        return user
    except Exception as e:
        logger.error(f"Ошибка при получении пользователя: {e}")
        return None

def create_user(db: Session, user: schemas.UserCreate):
    """
    Создать нового пользователя.
    """
    try:
        hashed_password = ph.hash(user.password)
        db_user = models.User(username=user.username, password_hash=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Создан новый пользователь: {user.username}")
        return db_user
    except Exception as e:
        logger.error(f"Ошибка при создании пользователя: {e}")
        return None

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список категорий.
    """
    try:
        categories = db.query(models.Category).offset(skip).limit(limit).all()
        logger.info(f"Запрошено {len(categories)} категорий")
        return categories
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {e}")
        return []

def create_category(db: Session, category: schemas.CategoryBase):
    """
    Создать новую категорию.
    """
    try:
        db_category = models.Category(name=category.name)
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        logger.info(f"Создана новая категория: {category.name}")
        return db_category
    except Exception as e:
        logger.error(f"Ошибка при создании категории: {e}")
        return None

def get_products(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список товаров.
    """
    try:
        products = db.query(models.Product).offset(skip).limit(limit).all()
        logger.info(f"Запрошено {len(products)} товаров")
        return products
    except Exception as e:
        logger.error(f"Ошибка при получении товаров: {e}")
        return []

def create_product(db: Session, product: schemas.ProductBase):
    """
    Создать новый товар.
    """
    try:
        db_product = models.Product(**product.dict())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        logger.info(f"Создан новый товар: {product.name}")
        return db_product
    except Exception as e:
        logger.error(f"Ошибка при создании товара: {e}")
        return None

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список заказов.
    """
    try:
        orders = db.query(models.Order).options(joinedload(models.Order.items)).offset(skip).limit(limit).all()
        logger.info(f"Запрошено {len(orders)} заказов")
        return orders
    except Exception as e:
        logger.error(f"Ошибка при получении заказов: {e}")
        return []

def create_order(db: Session, order: schemas.OrderBase):
    """
    Создать новый заказ.
    """
    try:
        db_order = models.Order(user_id=order.user_id, status=order.status)
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        logger.info(f"Создан новый заказ для пользователя ID={order.user_id}")
        return db_order
    except Exception as e:
        logger.error(f"Ошибка при создании заказа: {e}")
        return None

def create_order_item(db: Session, order_item: schemas.OrderItemBase):
    """
    Создать новую позицию заказа.
    """
    try:
        db_order_item = models.OrderItem(**order_item.dict())
        db.add(db_order_item)
        db.commit()
        db.refresh(db_order_item)
        logger.info(f"Добавлена новая позиция заказа для заказа ID={order_item.order_id}")
        return db_order_item
    except Exception as e:
        logger.error(f"Ошибка при создании позиции заказа: {e}")
        return None

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Получить список пользователей.
    """
    try:
        users = db.query(models.User).offset(skip).limit(limit).all()
        logger.info(f"Запрошено {len(users)} пользователей")
        return users
    except Exception as e:
        logger.error(f"Ошибка при получении пользователей: {e}")
        return []