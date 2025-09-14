/* 1) Insert Tony Stark (let PK and account_type default). */
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

/* 2) Promote Tony to Admin (filter by PK via subquery). */
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = (
  SELECT account_id FROM public.account WHERE account_email = 'tony@starkent.com'
);

/* 3) Delete Tony (use PK via CTE to avoid multi-row issues). */
WITH t AS (
  SELECT account_id FROM public.account WHERE account_email = 'tony@starkent.com'
)
DELETE FROM public.account a
USING t
WHERE a.account_id = t.account_id;

/* 4) Change “small interiors” -> “a huge interior” on GM Hummer (single UPDATE using REPLACE). */
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = (
  SELECT inv_id FROM public.inventory
  WHERE inv_make = 'GM' AND inv_model = 'Hummer'
  LIMIT 1
);

/* 5) Inner join: make, model, classification for items in “Sport”. (Should return two rows.) */
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

/* 6) Add “/vehicles” to the middle of all image paths (single UPDATE). */
UPDATE public.inventory
SET
  inv_image     = REPLACE(inv_image,     '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
