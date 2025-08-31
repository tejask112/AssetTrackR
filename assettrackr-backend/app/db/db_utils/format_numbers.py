from decimal import Decimal, ROUND_HALF_UP

def format_quantity(x) -> str:
    d = x if isinstance(x, Decimal) else Decimal(str(x))
    d2 = d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) 
    if d2 == d2.to_integral_value(rounding=ROUND_HALF_UP):
        return str(d2.quantize(Decimal("1")))
    return format(d2, "f")