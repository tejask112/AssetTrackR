from decimal import Decimal

def to_jsonable(x):
    if isinstance(x, Decimal): return str(x) 
    if isinstance(x, dict):    return {k: to_jsonable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)): return [to_jsonable(v) for v in x]
    return x