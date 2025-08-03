"""merge heads 49662863c8ea and 881b8321bf44

Revision ID: 7b01724c36bb
Revises: 881b8321bf44, 49662863c8ea
Create Date: 2025-08-03 18:51:02.049401

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '7b01724c36bb'
down_revision = ('881b8321bf44', '49662863c8ea')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
