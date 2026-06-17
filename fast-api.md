# FastAPI Complete Learning Notes
### Lectures 131–132 | Hitesh Choudhary — Chai aur Code
### Expanded from basics → Ollama integration

---

## Table of Contents

1. [What is FastAPI?](#1-what-is-fastapi)
2. [Environment Setup & Dependencies](#2-environment-setup--dependencies)
3. [Your First FastAPI App](#3-your-first-fastapi-app)
4. [Path Parameters and Query Parameters](#4-path-parameters-and-query-parameters)
5. [Request Body with Pydantic](#5-request-body-with-pydantic)
6. [Response Models and Status Codes](#6-response-models-and-status-codes)
7. [HTTP Methods — GET, POST, PUT, PATCH, DELETE](#7-http-methods--get-post-put-patch-delete)
8. [Dependency Injection](#8-dependency-injection)
9. [Routers — Organizing Large Applications](#9-routers--organizing-large-applications)
10. [Middleware](#10-middleware)
11. [Error Handling](#11-error-handling)
12. [Integrating Ollama with FastAPI](#12-integrating-ollama-with-fastapi)
13. [Streaming Responses with Ollama](#13-streaming-responses-with-ollama)
14. [Project Structure Best Practices](#14-project-structure-best-practices)
15. [Concept Relationships Map](#15-concept-relationships-map)
16. [FastAPI Cheat Sheet](#16-fastapi-cheat-sheet)
17. [Roadmap: Beginner to Advanced](#17-roadmap-beginner-to-advanced)
18. [Revision Notes](#18-revision-notes)

---

## 1. What is FastAPI?

### 1.1 Concept Overview

**Definition:** FastAPI is a modern, high-performance Python web framework for building APIs, based on standard Python type hints.

**Created by:** Sebastián Ramírez (tiangolo)

**Problem it solves:**
- Traditional frameworks (Flask, Django) require you to manually validate request data, write serialization logic, and generate API documentation separately.
- FastAPI does all three automatically using Python type annotations — the same annotations you already write.

**Key characteristics:**
- **Fast to run:** Built on Starlette (ASGI) and Pydantic. One of the fastest Python frameworks available — comparable to NodeJS and Go.
- **Fast to develop:** Automatic data validation, automatic serialization, automatic interactive docs.
- **Type-safe:** Full type hint support means editor autocomplete and runtime validation come for free.

### 1.2 FastAPI vs Flask vs Django

| Feature | FastAPI | Flask | Django |
|---|---|---|---|
| Type | ASGI (async) | WSGI (sync) | WSGI (sync) |
| Data validation | Built-in (Pydantic) | Manual | Manual or DRF |
| Auto docs | Yes (Swagger + ReDoc) | No | No |
| Performance | Very High | Medium | Medium |
| Learning curve | Low-Medium | Low | High |
| Best for | APIs, ML serving | Small apps | Full-stack web |
| Async support | Native | Limited (Flask 2+) | Limited |

### 1.3 How FastAPI Works Internally

```
HTTP Request comes in
        ↓
Starlette (ASGI layer) handles HTTP protocol
        ↓
FastAPI router matches URL to endpoint function
        ↓
Pydantic validates path params, query params, body
        ↓
Your function runs with validated data
        ↓
Return value → Pydantic serializes to JSON
        ↓
HTTP Response sent back
```

**ASGI vs WSGI:**
- **WSGI** (Flask/Django): one request at a time per worker, synchronous
- **ASGI** (FastAPI): handles thousands of concurrent connections with `async/await`, non-blocking I/O

### 1.4 Why FastAPI for AI Engineers?

AI engineers specifically benefit because:
- Serving ML models requires high concurrency (many users hitting inference endpoints)
- LLM API calls are I/O-bound — `async/await` lets FastAPI handle other requests while waiting for the model response
- Pydantic models perfectly validate complex AI request/response schemas
- Streaming responses (`StreamingResponse`) match how LLMs stream tokens

### 1.5 Key Takeaways

- FastAPI = performance + auto-validation + auto-docs
- Built on Starlette (ASGI) + Pydantic
- Native `async/await` support
- Generates Swagger UI and ReDoc automatically from your code
- The go-to framework for serving AI/ML models in Python

---

## 2. Environment Setup & Dependencies

### 2.1 Concept Overview

**Problem solved:** Python projects need isolated dependency environments to avoid version conflicts between projects. A `venv` ensures your FastAPI project's packages don't interfere with other projects or your system Python.

### 2.2 Step-by-Step Setup

**Step 1 — Create and activate a virtual environment:**

```bash
# Create
python -m venv myenv

# Activate — macOS/Linux
source myenv/bin/activate

# Activate — Windows
myenv\Scripts\activate

# You'll see (myenv) in your terminal prompt when active
# Deactivate when done
deactivate
```

**Step 2 — Install FastAPI:**

```bash
# Option A: Install everything (recommended for development)
pip install "fastapi[all]"
# This installs: fastapi + uvicorn + pydantic + python-multipart + email-validator
# and other useful extras

# Option B: Minimal install (lean production)
pip install fastapi
pip install uvicorn[standard]
```

**What is Uvicorn?**
- FastAPI is an ASGI framework — it doesn't run on its own
- Uvicorn is the ASGI server that actually listens for HTTP connections and hands them to FastAPI
- Think of it like: FastAPI = your application logic | Uvicorn = the server that runs it

```bash
# Additional commonly needed packages
pip install sqlalchemy          # database ORM
pip install python-jose[cryptography]  # JWT auth
pip install passlib[bcrypt]     # password hashing
pip install python-dotenv       # environment variables from .env
pip install httpx               # async HTTP client (for calling external APIs)
pip install ollama              # Ollama Python client (Lecture 132)
```

**Step 3 — Save dependencies:**

```bash
pip freeze > requirements.txt

# Later, reproduce the environment:
pip install -r requirements.txt
```

**Step 4 — Run the application:**

```bash
uvicorn main:app --reload
```

Breaking this down:
- `main` — the filename (`main.py`)
- `app` — the FastAPI instance variable inside that file (`app = FastAPI()`)
- `--reload` — auto-restart on code changes (development only, never in production)
- Default URL: `http://127.0.0.1:8000`

**Auto-generated docs:**
- `http://127.0.0.1:8000/docs` — Swagger UI (interactive)
- `http://127.0.0.1:8000/redoc` — ReDoc (cleaner, read-only)

### 2.3 Production Server Options

```bash
# Development
uvicorn main:app --reload

# Production — multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Or with Gunicorn as process manager + Uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 2.4 Project File Structure (minimal start)

```
my_fastapi_project/
├── myenv/              ← virtual environment (never commit to git)
├── main.py             ← FastAPI application entry point
├── requirements.txt    ← dependencies
└── .gitignore          ← include myenv/ and __pycache__/
```

`.gitignore` content:
```
myenv/
__pycache__/
*.pyc
.env
```

### 2.5 Common Mistakes

| Mistake | Fix |
|---|---|
| Forgetting to activate venv before installing | Always check for `(myenv)` in terminal |
| Using `--reload` in production | Only use in development |
| Committing `myenv/` to git | Add to `.gitignore`, commit `requirements.txt` instead |
| `uvicorn main:app` — wrong variable name | The variable after `:` must match your `app = FastAPI()` |

### 2.6 Key Takeaways

- Always use a virtual environment — never install into system Python
- `pip install "fastapi[all]"` installs everything you need to start
- Uvicorn is the ASGI server that actually runs FastAPI
- `--reload` = dev mode auto-restart
- Docs are auto-generated at `/docs` and `/redoc`

---

## 3. Your First FastAPI App

### 3.1 The Minimal App

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}
```

Run:
```bash
uvicorn main:app --reload
```

Visit `http://127.0.0.1:8000` → `{"message": "Hello, FastAPI!"}`  
Visit `http://127.0.0.1:8000/docs` → Interactive Swagger UI generated automatically

### 3.2 What Each Part Does

```python
from fastapi import FastAPI   # import the framework

app = FastAPI()               # create the application instance
                              # this is what uvicorn points to (main:app)

@app.get("/")                 # decorator: register this function as a GET handler
                              # for the "/" route
def read_root():              # the handler function
    return {"message": "..."}  # returned dict is auto-serialized to JSON
```

### 3.3 Async vs Sync Endpoints

FastAPI supports both:

```python
# Sync endpoint — for CPU-bound tasks
@app.get("/sync")
def sync_endpoint():
    result = heavy_computation()  # blocks the thread
    return result

# Async endpoint — for I/O-bound tasks (DB calls, external APIs, LLMs)
@app.get("/async")
async def async_endpoint():
    result = await external_api_call()  # non-blocking
    return result
```

**Rule of thumb:**
- Calling external APIs / databases / LLMs → use `async def`
- Pure computation with no I/O → use `def`
- If unsure → use `async def`

### 3.4 Application Metadata

```python
app = FastAPI(
    title="My AI API",
    description="FastAPI + Ollama integration",
    version="1.0.0",
    docs_url="/docs",       # customize docs URL
    redoc_url="/redoc",     # customize redoc URL
)
```

### 3.5 Key Takeaways

- `app = FastAPI()` creates the application
- `@app.get("/path")` registers a route
- Return a dict → FastAPI auto-converts to JSON response
- Use `async def` for I/O-bound endpoints (most AI/API work)
- Swagger docs generated at `/docs` with zero extra code

---

## 4. Path Parameters and Query Parameters

### 4.1 Concept Overview

**Path parameters:** Variables embedded in the URL path itself.  
`/users/42` → `42` is a path parameter (user id)

**Query parameters:** Key-value pairs after the `?` in the URL.  
`/users?page=2&limit=10` → `page` and `limit` are query parameters

### 4.2 Path Parameters

```python
from fastapi import FastAPI

app = FastAPI()

# {user_id} in the path → becomes a function parameter
@app.get("/users/{user_id}")
def get_user(user_id: int):  # type annotation enforces validation
    return {"user_id": user_id, "name": "Alice"}
```

URL: `GET /users/42` → `{"user_id": 42, "name": "Alice"}`  
URL: `GET /users/abc` → `422 Unprocessable Entity` (can't coerce "abc" to int)

**Multiple path parameters:**
```python
@app.get("/users/{user_id}/posts/{post_id}")
def get_user_post(user_id: int, post_id: int):
    return {"user_id": user_id, "post_id": post_id}
```

**Path parameter with Enum (restrict valid values):**
```python
from enum import Enum

class ModelName(str, Enum):
    llama = "llama"
    mistral = "mistral"
    gemma = "gemma"

@app.get("/models/{model_name}")
def get_model_info(model_name: ModelName):
    return {"model": model_name, "status": "available"}

# GET /models/llama → OK
# GET /models/gpt4 → 422 — value not in enum
```

### 4.3 Query Parameters

Any function parameter that is NOT in the path is treated as a query parameter:

```python
@app.get("/users")
def list_users(page: int = 1, limit: int = 10):
    # page and limit come from query string
    return {"page": page, "limit": limit}
```

URL: `GET /users` → `{"page": 1, "limit": 10}` (defaults)  
URL: `GET /users?page=3&limit=5` → `{"page": 3, "limit": 5}`

**Optional query parameters:**
```python
from typing import Optional

@app.get("/items")
def search_items(q: Optional[str] = None, category: Optional[str] = None):
    if q:
        return {"search": q, "category": category}
    return {"items": "all"}
```

**Required query parameter (no default):**
```python
@app.get("/search")
def search(q: str):  # no default → required query param
    return {"query": q}

# GET /search → 422 (q is missing)
# GET /search?q=pydantic → {"query": "pydantic"}
```

### 4.4 Path vs Query — When to Use Which

| Use case | Use |
|---|---|
| Identifying a specific resource | Path: `/users/42` |
| Filtering, sorting, pagination | Query: `/users?role=admin&page=2` |
| Required identifier | Path |
| Optional filter | Query |

### 4.5 Common Mistakes

```python
# WRONG: Path param declared but not in route
@app.get("/users")
def get_user(user_id: int):  # FastAPI treats this as a query param, not path!
    ...

# CORRECT: Must be in the path template
@app.get("/users/{user_id}")
def get_user(user_id: int):
    ...
```

```python
# WRONG: Order matters — specific routes before generic ones
@app.get("/items/{item_id}")   # this matches /items/all too!
def get_item(item_id: str): ...

@app.get("/items/all")         # NEVER reached — already matched above
def get_all_items(): ...

# CORRECT: Put specific routes first
@app.get("/items/all")         # specific first
def get_all_items(): ...

@app.get("/items/{item_id}")   # generic after
def get_item(item_id: str): ...
```

### 4.6 Key Takeaways

- `{param}` in path template → path parameter → required by default
- Function params not in path → query parameters → optional if they have a default
- Type annotations enforce validation automatically
- Specific routes must be defined before generic `{param}` routes

---

## 5. Request Body with Pydantic

### 5.1 Concept Overview

For POST/PUT/PATCH requests, data comes in the **request body** (JSON). FastAPI uses Pydantic models to define, validate, and parse this data automatically.

**Problem solved:** Without this, you'd have to manually parse `request.json()`, check types, validate constraints, and raise errors. FastAPI + Pydantic makes this declarative and automatic.

### 5.2 Basic Request Body

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CreateUserRequest(BaseModel):
    username: str
    email: str
    age: int

@app.post("/users")
def create_user(body: CreateUserRequest):
    # body is already validated by the time this function runs
    # body.username, body.email, body.age are ready to use
    return {"message": f"User {body.username} created", "id": 42}
```

FastAPI knows `body` is a request body because its type is a `BaseModel` subclass (not a primitive like `int` or `str`).

### 5.3 Combining Path Params, Query Params, and Body

```python
from typing import Optional

class UpdateProductRequest(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None

@app.put("/products/{product_id}")
def update_product(
    product_id: int,             # path parameter
    notify: bool = False,        # query parameter
    body: UpdateProductRequest = None  # request body
):
    return {
        "product_id": product_id,
        "notify": notify,
        "updates": body.model_dump(exclude_none=True) if body else {}
    }
```

FastAPI distinguishes these automatically:
- `product_id` is in the path → path parameter
- `notify` is not in the path and is a primitive → query parameter
- `body` is a Pydantic model → request body

### 5.4 Validation in Action

```python
class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: str
    age: int = Field(..., ge=0, le=120)
    password: str = Field(..., min_length=8)

@app.post("/users")
def create_user(body: CreateUserRequest):
    return {"username": body.username}
```

If client sends:
```json
{"username": "ab", "email": "test@test.com", "age": 25, "password": "secret123"}
```

FastAPI auto-returns:
```json
{
  "detail": [
    {
      "loc": ["body", "username"],
      "msg": "String should have at least 3 characters",
      "type": "string_too_short"
    }
  ]
}
```

No extra error handling code needed.

### 5.5 Production Usage — Separate Input/Output Schemas

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Input — what the API accepts
class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    password: str = Field(..., min_length=8)

# Output — what the API returns (no password)
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

@app.post("/users", response_model=UserResponse)
def create_user(body: CreateUserRequest) -> UserResponse:
    # In real code: save to DB, get back the created user with id
    new_user = save_to_db(body)
    return UserResponse(
        id=new_user.id,
        username=body.username,
        email=body.email,
        created_at=datetime.utcnow()
    )
```

### 5.6 Key Takeaways

- Declare a Pydantic model → FastAPI uses it as the request body schema
- Validation errors auto-return 422 with details
- Keep input and output schemas separate
- `response_model=` controls what fields are returned to the client
- Sensitive fields (passwords) should only be in input schemas, never output

---

## 6. Response Models and Status Codes

### 6.1 Response Models

`response_model` does two things:
1. Filters the output — only declared fields are returned
2. Generates correct response schema in Swagger docs

```python
class UserDB(BaseModel):
    id: int
    username: str
    email: str
    hashed_password: str  # internal field
    is_admin: bool

class UserPublicResponse(BaseModel):
    id: int
    username: str
    email: str
    # No hashed_password, no is_admin

@app.get("/users/{user_id}", response_model=UserPublicResponse)
def get_user(user_id: int):
    user = get_from_db(user_id)  # returns UserDB with all fields
    return user  # FastAPI filters to only UserPublicResponse fields
```

### 6.2 HTTP Status Codes

```python
from fastapi import FastAPI, status

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(body: CreateUserRequest):
    return {"message": "User created"}

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int):
    delete_from_db(user_id)
    # Return nothing for 204
```

**Common status codes:**

| Code | Constant | Meaning |
|---|---|---|
| 200 | `HTTP_200_OK` | Success (default GET) |
| 201 | `HTTP_201_CREATED` | Resource created (POST) |
| 204 | `HTTP_204_NO_CONTENT` | Success, no body (DELETE) |
| 400 | `HTTP_400_BAD_REQUEST` | Client sent bad data |
| 401 | `HTTP_401_UNAUTHORIZED` | Not authenticated |
| 403 | `HTTP_403_FORBIDDEN` | Authenticated but no permission |
| 404 | `HTTP_404_NOT_FOUND` | Resource not found |
| 422 | `HTTP_422_UNPROCESSABLE_ENTITY` | Validation failed (auto by FastAPI) |
| 500 | `HTTP_500_INTERNAL_SERVER_ERROR` | Server error |

### 6.3 Key Takeaways

- `response_model=` filters output fields and documents the response schema
- Always set correct status codes — `201` for creation, `204` for deletion
- FastAPI auto-sends `422` on validation failure — you don't handle this manually

---

## 7. HTTP Methods — GET, POST, PUT, PATCH, DELETE

### 7.1 All Methods

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Product(BaseModel):
    name: str
    price: float
    category: str

class UpdateProduct(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None

# READ all
@app.get("/products")
def list_products():
    return [{"id": 1, "name": "Laptop"}]

# READ one
@app.get("/products/{product_id}")
def get_product(product_id: int):
    return {"id": product_id, "name": "Laptop"}

# CREATE
@app.post("/products", status_code=201)
def create_product(body: Product):
    return {"id": 42, **body.model_dump()}

# FULL UPDATE — replace entire resource
@app.put("/products/{product_id}")
def replace_product(product_id: int, body: Product):
    return {"id": product_id, **body.model_dump()}

# PARTIAL UPDATE — update only provided fields
@app.patch("/products/{product_id}")
def update_product(product_id: int, body: UpdateProduct):
    updates = body.model_dump(exclude_unset=True)  # only what was sent
    return {"id": product_id, "updated_fields": updates}

# DELETE
@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int):
    pass  # delete from DB, return nothing
```

### 7.2 PUT vs PATCH

| | PUT | PATCH |
|---|---|---|
| Meaning | Replace the full resource | Update only provided fields |
| Body | Complete resource required | Only fields to change |
| Pydantic model | All fields required | All fields Optional with defaults |
| `model_dump` option | — | `exclude_unset=True` |

### 7.3 Key Takeaways

- GET = read, POST = create, PUT = full replace, PATCH = partial update, DELETE = remove
- PATCH endpoints use `model_dump(exclude_unset=True)` to only touch fields the client sent
- Return `None` (or nothing) for 204 responses

---

## 8. Dependency Injection

### 8.1 Concept Overview

Dependency injection (DI) is FastAPI's way of sharing logic, database connections, authentication, and configuration across multiple endpoints without duplicating code.

**Problem solved:** Without DI, you'd repeat the same authentication check, DB connection setup, or config loading in every endpoint. DI lets you declare it once and inject it wherever needed.

### 8.2 Basic Dependency

```python
from fastapi import FastAPI, Depends

app = FastAPI()

# A dependency is just a function
def get_db_connection():
    db = connect_to_database()  # simplified
    try:
        yield db          # yield = provide and keep alive
    finally:
        db.close()        # cleanup after request completes

@app.get("/users")
def list_users(db = Depends(get_db_connection)):
    # db is the connection from get_db_connection()
    users = db.query("SELECT * FROM users")
    return users
```

### 8.3 Auth Dependency

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token != "valid-token":  # in production: decode JWT
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return {"user_id": 1}  # return decoded user info

@app.get("/protected")
def protected_route(user = Depends(verify_token)):
    return {"message": f"Hello user {user['user_id']}"}
```

### 8.4 Query Parameter Dependencies (DRY Pagination)

```python
from pydantic import BaseModel

class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 10

def pagination(page: int = 1, limit: int = 10) -> PaginationParams:
    return PaginationParams(page=page, limit=limit)

@app.get("/products")
def list_products(params: PaginationParams = Depends(pagination)):
    offset = (params.page - 1) * params.limit
    return {"page": params.page, "limit": params.limit, "offset": offset}

@app.get("/users")
def list_users(params: PaginationParams = Depends(pagination)):
    # Same pagination logic reused
    ...
```

### 8.5 Key Takeaways

- `Depends(function)` injects the return value of `function` into your endpoint
- Use `yield` in dependencies for setup/teardown (e.g., DB connections)
- Great for: auth checks, DB sessions, pagination, rate limiting
- FastAPI handles dependency resolution — no manual calling needed

---

## 9. Routers — Organizing Large Applications

### 9.1 Concept Overview

As your app grows, putting all routes in `main.py` becomes unmanageable. `APIRouter` lets you split routes into separate files/modules and then include them in the main app.

### 9.2 Creating a Router

```python
# routers/users.py
from fastapi import APIRouter

router = APIRouter(
    prefix="/users",       # all routes in this router start with /users
    tags=["Users"],        # Swagger UI groups these under "Users"
)

@router.get("/")
def list_users():
    return [{"id": 1, "name": "Alice"}]

@router.get("/{user_id}")
def get_user(user_id: int):
    return {"id": user_id}

@router.post("/")
def create_user():
    return {"message": "created"}
```

```python
# routers/products.py
from fastapi import APIRouter

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/")
def list_products():
    return []
```

```python
# main.py
from fastapi import FastAPI
from routers import users, products

app = FastAPI()

app.include_router(users.router)
app.include_router(products.router)

# Routes available:
# GET /users/
# GET /users/{user_id}
# POST /users/
# GET /products/
```

### 9.3 Production File Structure

```
my_api/
├── main.py
├── routers/
│   ├── __init__.py
│   ├── users.py
│   ├── products.py
│   └── ai.py          ← Ollama/LLM routes
├── models/
│   ├── __init__.py
│   ├── user.py        ← Pydantic schemas
│   └── ai.py          ← AI request/response schemas
├── dependencies/
│   └── auth.py        ← auth dependencies
├── services/
│   └── ollama.py      ← Ollama integration logic
└── requirements.txt
```

### 9.4 Key Takeaways

- `APIRouter` splits routes into separate files
- `prefix` prepends a base path to all routes in the router
- `tags` groups routes in Swagger UI
- Include routers in `main.py` with `app.include_router()`

---

## 10. Middleware

### 10.1 Concept Overview

Middleware runs before every request reaches your endpoint and after every response leaves it. Use it for cross-cutting concerns: logging, CORS, rate limiting, request timing.

### 10.2 CORS Middleware (Critical for Frontend Integration)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourfrontend.com"],
    allow_credentials=True,
    allow_methods=["*"],    # GET, POST, PUT, etc.
    allow_headers=["*"],    # Authorization, Content-Type, etc.
)
```

CORS is required when your frontend (e.g., React on port 3000) calls your API (FastAPI on port 8000). Browsers block cross-origin requests by default.

### 10.3 Custom Middleware

```python
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)  # call the actual endpoint
    process_time = time.time() - start
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### 10.4 Key Takeaways

- Middleware runs on every request/response cycle
- CORS middleware is almost always required for web apps
- Custom middleware: `@app.middleware("http")` with `async def (request, call_next)`

---

## 11. Error Handling

### 11.1 HTTPException — Raising Custom Errors

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

fake_db = {1: {"name": "Alice"}, 2: {"name": "Bob"}}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in fake_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    return fake_db[user_id]
```

Response for unknown user:
```json
{
  "detail": "User 5 not found"
}
```

### 11.2 Custom Exception Handlers

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class DatabaseError(Exception):
    def __init__(self, message: str):
        self.message = message

@app.exception_handler(DatabaseError)
async def database_error_handler(request: Request, exc: DatabaseError):
    return JSONResponse(
        status_code=500,
        content={"error": "Database error", "detail": exc.message}
    )

@app.get("/data")
def get_data():
    raise DatabaseError("Connection refused")
    # → {"error": "Database error", "detail": "Connection refused"}
```

### 11.3 Validation Error Handler (Override Default)

```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": "Invalid input", "errors": exc.errors()}
    )
```

### 11.4 Key Takeaways

- `HTTPException(status_code=..., detail=...)` for expected errors (404, 401, etc.)
- `@app.exception_handler(ExceptionClass)` for global custom error handling
- FastAPI auto-handles `ValidationError` as 422 — override if you want custom format

---

## 12. Integrating Ollama with FastAPI

### 12.1 What is Ollama?

Ollama is a tool that lets you run open-source LLMs (Llama 3, Mistral, Gemma, etc.) **locally** on your machine, without needing API keys or internet access.

**Why Ollama for development:**
- No API costs during development
- No rate limits
- Data privacy (nothing leaves your machine)
- Works offline
- Simple REST API compatible with OpenAI's API format

**Available models:**
```bash
ollama pull llama3         # Meta's Llama 3
ollama pull mistral        # Mistral 7B
ollama pull gemma          # Google's Gemma
ollama pull codellama      # Code-focused Llama
ollama pull phi3           # Microsoft Phi-3 (small, fast)
```

### 12.2 Setting Up Ollama

**Option A — Direct install (macOS/Linux):**
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama server
ollama serve   # runs on http://localhost:11434
```

**Option B — Docker (recommended, as mentioned in lecture):**
```bash
docker pull ollama/ollama

# CPU only
docker run -d -p 11434:11434 --name ollama ollama/ollama

# With GPU (NVIDIA)
docker run -d --gpus=all -p 11434:11434 --name ollama ollama/ollama

# Pull a model inside the container
docker exec ollama ollama pull llama3
```

Docker advantages:
- Isolated environment — no system-level install
- Easy to start/stop/restart
- Consistent across team members
- Specific port mapping (`11434`) for clean local API access

### 12.3 Ollama's API

Ollama exposes a REST API at `http://localhost:11434`:

```
POST /api/generate     → generate text (non-streaming or streaming)
POST /api/chat         → chat completions (like OpenAI's chat API)
GET  /api/tags         → list installed models
POST /api/pull         → pull a model
```

You can call it directly with `httpx`/`requests`, or use the official `ollama` Python client.

### 12.4 Install the Ollama Python Client

```bash
pip install ollama
```

### 12.5 Basic Integration — FastAPI + Ollama

```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama

app = FastAPI(
    title="AI API",
    description="FastAPI + Ollama LLM Integration",
    version="1.0.0"
)

# --- Pydantic Schemas ---

class PromptRequest(BaseModel):
    prompt: str
    model: str = "llama3"         # default model
    temperature: float = 0.7      # controls randomness

class PromptResponse(BaseModel):
    model: str
    response: str
    prompt_tokens: int = 0
    completion_tokens: int = 0

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI API is running"}

@app.get("/models")
def list_models():
    """List all locally available Ollama models."""
    try:
        models = ollama.list()
        return {"models": [m["name"] for m in models["models"]]}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama not available: {str(e)}")

@app.post("/generate", response_model=PromptResponse)
def generate(body: PromptRequest):
    """Generate a response from an LLM."""
    try:
        response = ollama.generate(
            model=body.model,
            prompt=body.prompt,
            options={"temperature": body.temperature}
        )
        return PromptResponse(
            model=body.model,
            response=response["response"],
        )
    except ollama.ResponseError as e:
        raise HTTPException(status_code=400, detail=f"Model error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama unavailable: {str(e)}")
```

**Test it:**
```bash
# Start ollama
ollama serve

# Start FastAPI
uvicorn main:app --reload

# Make a request
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is FastAPI?", "model": "llama3"}'
```

### 12.6 Chat Endpoint (Multi-turn Conversation)

```python
from typing import List

class Message(BaseModel):
    role: str      # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "llama3"

class ChatResponse(BaseModel):
    model: str
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    """Multi-turn chat with conversation history."""
    try:
        messages = [{"role": m.role, "content": m.content} for m in body.messages]
        response = ollama.chat(
            model=body.model,
            messages=messages
        )
        return ChatResponse(
            model=body.model,
            response=response["message"]["content"]
        )
    except ollama.ResponseError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

**Request body:**
```json
{
  "model": "llama3",
  "messages": [
    {"role": "user", "content": "My name is Bhavesh."},
    {"role": "assistant", "content": "Hello Bhavesh! How can I help you?"},
    {"role": "user", "content": "What is my name?"}
  ]
}
```

### 12.7 Using httpx (Direct REST API, No Client Library)

```python
import httpx

OLLAMA_BASE_URL = "http://localhost:11434"

@app.post("/generate-raw")
async def generate_raw(body: PromptRequest):
    """Call Ollama REST API directly using httpx."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": body.model,
                "prompt": body.prompt,
                "stream": False
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Ollama request failed")
        data = response.json()
        return {"response": data["response"]}
```

### 12.8 Error Handling for Ollama

```python
from fastapi import HTTPException
import ollama

def safe_ollama_call(func, *args, **kwargs):
    """Wrapper for safe Ollama calls with proper error handling."""
    try:
        return func(*args, **kwargs)
    except ollama.ResponseError as e:
        # Model not found, bad parameters, etc.
        raise HTTPException(status_code=400, detail=f"Ollama error: {e.error}")
    except httpx.ConnectError:
        # Ollama server not running
        raise HTTPException(status_code=503, detail="Ollama server is not running. Start with: ollama serve")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
```

### 12.9 Testing the Integration

```bash
# Test with curl
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain neural networks in 2 sentences.", "model": "llama3"}'

# Test /models endpoint
curl http://localhost:8000/models

# Use Swagger UI (easiest)
# Open http://localhost:8000/docs in browser
# Click on any endpoint → "Try it out" → fill in body → Execute
```

### 12.10 Key Takeaways

- Ollama runs LLMs locally — no API keys, no cost, no data leakage
- Docker is the cleanest way to run Ollama (port 11434)
- `pip install ollama` gives you the Python client
- Use `ollama.generate()` for single prompts, `ollama.chat()` for conversations
- Always wrap Ollama calls in try/except — the server might not be running
- Test through Swagger UI at `/docs` — it's faster than writing curl commands

---

## 13. Streaming Responses with Ollama

### 13.1 Concept Overview

LLMs generate tokens one at a time. Waiting for the full response before sending anything creates a bad user experience — the UI freezes for seconds, then dumps all text at once.

**Streaming** sends tokens to the client as they're generated — the user sees text appearing word by word, like ChatGPT.

### 13.2 Streaming with FastAPI

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import ollama

app = FastAPI()

class PromptRequest(BaseModel):
    prompt: str
    model: str = "llama3"

@app.post("/stream")
def stream_response(body: PromptRequest):
    """Stream LLM tokens as they are generated."""

    def generate_tokens():
        # stream=True → Ollama yields chunks as they arrive
        for chunk in ollama.generate(
            model=body.model,
            prompt=body.prompt,
            stream=True
        ):
            token = chunk.get("response", "")
            if token:
                yield token    # send each token immediately to client

    return StreamingResponse(
        generate_tokens(),
        media_type="text/plain"
    )
```

**Test streaming:**
```bash
curl -X POST http://localhost:8000/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a poem about Python.", "model": "llama3"}' \
  --no-buffer
```

You'll see tokens appearing in the terminal one by one.

### 13.3 Server-Sent Events (SSE) Streaming

For frontend integration (React, etc.), SSE format is standard:

```python
from fastapi.responses import StreamingResponse
import json

@app.post("/stream-sse")
async def stream_sse(body: PromptRequest):
    """Stream as Server-Sent Events (SSE) for frontend consumption."""

    async def event_generator():
        for chunk in ollama.generate(
            model=body.model,
            prompt=body.prompt,
            stream=True
        ):
            token = chunk.get("response", "")
            if token:
                # SSE format: "data: <content>\n\n"
                data = json.dumps({"token": token, "done": False})
                yield f"data: {data}\n\n"

        # Signal completion
        yield f"data: {json.dumps({'token': '', 'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )
```

**Frontend consumption (JavaScript):**
```javascript
const eventSource = new EventSource('http://localhost:8000/stream-sse', {
    method: 'POST',
    // Note: EventSource doesn't support POST natively; use fetch with ReadableStream
});

// Better approach with fetch:
const response = await fetch('http://localhost:8000/stream-sse', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ prompt: "Hello!", model: "llama3" })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // Parse SSE and append token to UI
    console.log(chunk);
}
```

### 13.4 Key Takeaways

- `StreamingResponse` sends data incrementally — essential for LLM UX
- `stream=True` in `ollama.generate()` → generator that yields chunks
- Use `text/plain` for simple streaming, `text/event-stream` for SSE (frontend integration)
- Streaming is I/O-bound → use `async def` endpoints

---

## 14. Project Structure Best Practices

### 14.1 Complete Production Structure

```
ai_api/
├── main.py                    ← app entry point
├── requirements.txt
├── .env                       ← environment variables (never commit)
├── .env.example               ← template (commit this)
├── .gitignore
│
├── routers/
│   ├── __init__.py
│   ├── health.py              ← /health endpoint
│   ├── ai.py                  ← /generate, /chat, /stream
│   └── models.py              ← /models (list available)
│
├── schemas/                   ← Pydantic models
│   ├── __init__.py
│   ├── ai.py                  ← PromptRequest, ChatRequest, etc.
│   └── common.py              ← shared schemas
│
├── services/
│   ├── __init__.py
│   └── ollama_service.py      ← Ollama interaction logic
│
├── dependencies/
│   ├── __init__.py
│   └── auth.py                ← auth dependencies
│
└── config.py                  ← settings with pydantic-settings
```

### 14.2 Config with Pydantic Settings

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    default_model: str = "llama3"
    api_key: str = ""          # from .env
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

`.env` file:
```
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODEL=llama3
API_KEY=your-secret-key
DEBUG=false
```

### 14.3 Service Layer Pattern

```python
# services/ollama_service.py
import ollama
from fastapi import HTTPException

class OllamaService:
    def __init__(self, base_url: str, default_model: str):
        self.client = ollama.Client(host=base_url)
        self.default_model = default_model

    def generate(self, prompt: str, model: str = None) -> str:
        model = model or self.default_model
        try:
            response = self.client.generate(model=model, prompt=prompt)
            return response["response"]
        except ollama.ResponseError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def list_models(self) -> list:
        return [m["name"] for m in self.client.list()["models"]]

# Singleton instance
from config import settings
ollama_service = OllamaService(
    base_url=settings.ollama_base_url,
    default_model=settings.default_model
)
```

```python
# routers/ai.py
from fastapi import APIRouter
from schemas.ai import PromptRequest, PromptResponse
from services.ollama_service import ollama_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/generate", response_model=PromptResponse)
async def generate(body: PromptRequest):
    response_text = ollama_service.generate(body.prompt, body.model)
    return PromptResponse(model=body.model, response=response_text)
```

### 14.4 Key Takeaways

- Separate concerns: routers → schemas → services → dependencies
- Use `pydantic-settings` for config/env management
- Service layer isolates Ollama logic from route handlers
- Never hardcode URLs, model names, or secrets — use `.env`

---

## 15. Concept Relationships Map

```
FastAPI Application
        ↓
   app = FastAPI()
        ↓
   Middleware (CORS, logging, timing)
        ↓
   Router (APIRouter)
        ├── Path Parameters  → /users/{id}
        ├── Query Parameters → /users?page=1
        └── Request Body     → Pydantic BaseModel
                    ↓
              Validation (automatic, 422 on failure)
                    ↓
              Dependency Injection (Depends)
              ├── Auth
              ├── DB connection
              └── Config/Settings
                    ↓
              Endpoint Function (def / async def)
                    ↓
              External Services
              └── Ollama (LLM)
                    ├── ollama.generate()     → single prompt
                    ├── ollama.chat()         → multi-turn
                    └── stream=True           → StreamingResponse
                    ↓
              Response
              ├── response_model=  → filter output
              ├── status_code=     → HTTP status
              └── StreamingResponse → token-by-token
```

**Learning dependency chain:**
```
FastAPI basics (app, routes, run)
    → Path + Query params (type-annotated)
        → Request body (Pydantic models)
            → Response models + status codes
                → HTTP methods (GET/POST/PUT/PATCH/DELETE)
                    → Dependency injection
                        → Routers (modular structure)
                            → Middleware + Error handling
                                → Ollama integration (generate/chat)
                                    → Streaming responses
                                        → Production structure + config
```

---

## 16. FastAPI Cheat Sheet

### Setup

```bash
pip install "fastapi[all]" uvicorn ollama httpx
uvicorn main:app --reload          # dev
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4  # prod
```

### App Skeleton

```python
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List

app = FastAPI(title="My API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])
```

### Route Decorators

```python
@app.get("/path")
@app.post("/path")
@app.put("/path/{id}")
@app.patch("/path/{id}")
@app.delete("/path/{id}", status_code=204)
```

### Parameters

```python
# Path
@app.get("/users/{user_id}")
def get_user(user_id: int): ...

# Query
@app.get("/users")
def list_users(page: int = 1, q: Optional[str] = None): ...

# Body (Pydantic model)
@app.post("/users")
def create_user(body: CreateUserRequest): ...
```

### Response Control

```python
@app.get("/users/{id}", response_model=UserResponse, status_code=200)
def get_user(id: int): ...
```

### Errors

```python
raise HTTPException(status_code=404, detail="Not found")
raise HTTPException(status_code=401, detail="Unauthorized")
```

### Dependency

```python
def get_db():
    db = connect(); yield db; db.close()

@app.get("/data")
def read(db=Depends(get_db)): ...
```

### Router

```python
router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def list_users(): ...

app.include_router(router)
```

### Ollama Integration

```python
import ollama

# Generate
response = ollama.generate(model="llama3", prompt="Hello")
text = response["response"]

# Chat
response = ollama.chat(model="llama3", messages=[
    {"role": "user", "content": "Hi"},
])
text = response["message"]["content"]

# Stream
for chunk in ollama.generate(model="llama3", prompt="...", stream=True):
    token = chunk.get("response", "")
    yield token

# In FastAPI
return StreamingResponse(generate_tokens(), media_type="text/plain")
```

### Ollama Docker

```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec ollama ollama pull llama3
# API at: http://localhost:11434
```

### Common Status Codes

| Code | Use |
|---|---|
| 200 | Default GET success |
| 201 | POST — resource created |
| 204 | DELETE — no body |
| 400 | Bad request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Validation failed (auto) |
| 500 | Server error |

---

## 17. Roadmap: Beginner to Advanced

```
BEGINNER
│
├── 1. Understand ASGI vs WSGI, why FastAPI
├── 2. Setup venv + install FastAPI + Uvicorn
├── 3. Create minimal app, run with Uvicorn
├── 4. Define GET routes, understand decorators
├── 5. Path parameters with type annotations
├── 6. Query parameters with defaults
│
INTERMEDIATE
│
├── 7. POST endpoint with Pydantic request body
├── 8. response_model + status_code
├── 9. PUT vs PATCH (model_dump exclude_unset)
├── 10. DELETE endpoint
├── 11. HTTPException for error handling
├── 12. CORS middleware
├── 13. Dependency injection basics
├── 14. APIRouter for modular structure
│
ADVANCED
│
├── 15. Ollama setup (Docker)
├── 16. ollama.generate() endpoint
├── 17. ollama.chat() with message history
├── 18. StreamingResponse for token streaming
├── 19. Server-Sent Events (SSE) for frontend
├── 20. pydantic-settings for config/.env
├── 21. Service layer pattern
├── 22. JWT authentication
├── 23. Database integration (SQLAlchemy + async)
└── 24. Deploy: Docker container + Render/Railway
```

---

## 18. Revision Notes

**What is FastAPI?**  
Modern Python web framework for APIs. ASGI-based (async). Auto-validation via Pydantic. Auto-generates Swagger docs at `/docs`.

**Setup**  
`python -m venv myenv` → activate → `pip install "fastapi[all]"` → `uvicorn main:app --reload`

**App instance**  
`app = FastAPI()`. Uvicorn points to it: `uvicorn main:app`.

**Routes**  
`@app.get("/path")`, `@app.post("/path")`, etc. Return a dict → auto-JSON.

**Path params**  
`@app.get("/users/{user_id}")` + `def fn(user_id: int)` — type annotation enforces validation.

**Query params**  
Function params not in the path → query params. Default = optional. No default = required.

**Request body**  
Function param typed as a Pydantic `BaseModel` subclass → auto-parsed from JSON body.

**Response model**  
`@app.get("/", response_model=MyResponse)` — filters output, documents schema.

**Status codes**  
`status_code=201` on decorator. Use `from fastapi import status` for readable constants.

**HTTP methods**  
GET = read, POST = create, PUT = full replace, PATCH = partial update, DELETE = remove.  
PATCH uses `model_dump(exclude_unset=True)`.

**Dependency Injection**  
`Depends(function)` — inject reusable logic (auth, DB, pagination) into endpoints.

**Routers**  
`APIRouter(prefix="/users", tags=["Users"])`. Include with `app.include_router(router)`.

**CORS**  
`CORSMiddleware` — required when frontend and API are on different origins.

**Errors**  
`raise HTTPException(status_code=404, detail="message")`. FastAPI auto-returns 422 for validation failures.

**Ollama**  
Local LLM runner. Docker: `docker run -d -p 11434:11434 ollama/ollama`.  
`pip install ollama`. Call: `ollama.generate(model="llama3", prompt="...")`.  
Chat: `ollama.chat(model="llama3", messages=[...])`.  
Stream: `ollama.generate(..., stream=True)` → `StreamingResponse(generator)`.

**Error handling for Ollama**  
Wrap in try/except. Catch `ollama.ResponseError` (bad model/params) and `httpx.ConnectError` (server not running).

**Production structure**  
Split into: `routers/`, `schemas/`, `services/`, `dependencies/`, `config.py`. Use `pydantic-settings` for env vars.
``` 