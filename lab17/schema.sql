create database if not exists lab17_phones
character set utf8mb4 collate utf8mb4_unicode_ci;

use lab17_phones;

create table if not exists phones (
    id int unsigned not null auto_increment primary key,
    model varchar(150) not null,
    brand varchar(80) not null,
    memory_gb smallint unsigned not null,
    price decimal(10, 2) not null,
    created_at timestamp not null default current_timestamp,
    constraint phones_unique_model unique (model, brand, memory_gb),
    constraint phones_model_check check (char_length(trim(model)) between 1 and 150),
    constraint phones_brand_check check (char_length(trim(brand)) between 1 and 80),
    constraint phones_memory_check check (memory_gb in (32, 64, 128, 256, 512, 1024)),
    constraint phones_price_check check (price > 0 and price <= 9999999.99)
) engine = InnoDB;

insert into phones (model, brand, memory_gb, price)
values
    ('iPhone 15', 'Apple', 128, 31999),
    ('Galaxy S24', 'Samsung', 256, 36999),
    ('Xiaomi 14', 'Xiaomi', 256, 29999),
    ('Pixel 8', 'Google', 128, 24999),
    ('G42', 'Nokia', 128, 7999),
    ('iPhone 15', 'Apple', 256, 35999)
on duplicate key update id = id;
