from .auth import router as auth
from .mutations import router as mutations
from .outbreaks import router as outbreaks
from .predictions import router as predictions
from .sensors import router as sensors
from .blockchain import router as blockchain
from .llm import router as llm
from .simulation import router as simulation
from .mutation_vaccine import router as mutation_vaccine
from .explainability import router as explainability
from .anonymous_alert import router as anonymous_alert

# Import all routers to make them available from the routers package
