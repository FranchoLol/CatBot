import json

# Función para calcular el XP y dinero necesario por nivel
def generate_levels():
    levels = []
    xp = 100
    money = 10
    xp_multiplier = 1.0
    
    # Incrementos de XP y dinero
    xp_increments = [
        (500, 0.15),       # Del nivel 0 al 500
        (1000, 0.075),     # Del nivel 501 al 1000
        (1500, 0.0375),    # Del nivel 1001 al 1500
        (2000, 0.01875),   # Del nivel 1501 al 2000
        (2500, 0.009375),  # Del nivel 2001 al 2500
        (3000, 0.0046875), # Del nivel 2501 al 3000
        (3500, 0.00234375),# Del nivel 3001 al 3500
        (4000, 0.001171875),# Del nivel 3501 al 4000
        (4500, 0.0005859375),# Del nivel 4001 al 4500
        (5000, 0.00029296875),# Del nivel 4501 al 5000
        (5500, 0.000146484375),# Del nivel 5001 al 5500
        (6000, 0.0000732421875),# Del nivel 5501 al 6000
        (6500, 0.00003662109375),# Del nivel 6001 al 6500
        (7000, 0.000018310546875),# Del nivel 6501 al 7000
        (7500, 0.0000091552734375),# Del nivel 7001 al 7500
        (8000, 0.00000457763671875),# Del nivel 7501 al 8000
        (8500, 0.000002288818359375),# Del nivel 8001 al 8500
        (9000, 0.0000011444091796875),# Del nivel 8501 al 9000
        (9500, 0.00000057220458984375),# Del nivel 9001 al 9500
        (10000, 0.000000286102294921875),# Del nivel 9501 al 10000
        (10500, 0.0000001430511474609375),# Del nivel 10001 al 10500
        (11000, 0.00000007152557373046875),# Del nivel 10501 al 11000
        (11500, 0.000000035762786865234375),# Del nivel 11001 al 11500
        (12000, 0.000000017881393432617188),# Del nivel 11501 al 12000
        (12500, 0.000000008940696716308594),# Del nivel 12001 al 12500
        (13000, 0.000000004470348358154297),# Del nivel 12501 al 13000
        (13500, 0.000000002235174179077148),# Del nivel 13001 al 13500
        (14000, 0.000000001117587089538574),# Del nivel 13501 al 14000
        (14500, 0.000000000558793544769287),# Del nivel 14001 al 14500
        (15000, 0.000000000279396772384643),# Del nivel 14501 al 15000
        (15500, 0.000000000139698386192322),# Del nivel 15001 al 15500
        (16000, 0.000000000069849193096161),# Del nivel 15501 al 16000
        (16500, 0.0000000000349245965480805),# Del nivel 16001 al 16500
        (17000, 0.0000000000174622982740403),# Del nivel 16501 al 17000
        (17500, 0.00000000000873114913702015),# Del nivel 17001 al 17500
        (18000, 0.000000000004365574568510075),# Del nivel 17501 al 18000
        (18500, 0.0000000000021827872842550375),# Del nivel 18001 al 18500
        (19000, 0.0000000000010913936421275187),# Del nivel 18501 al 19000
        (19500, 0.0000000000005456968210637594),# Del nivel 19001 al 19500
        (20000, 0.0000000000002728484105318797),# Del nivel 19501 al 20000
        (20500, 0.0000000000001364242052659399),# Del nivel 20001 al 20500
        (21000, 0.00000000000006821210263296995),# Del nivel 20501 al 21000
        (21500, 0.000000000000034106051316484976),# Del nivel 21001 al 21500
        (22000, 0.000000000000017053025658242488),# Del nivel 21501 al 22000
        (22500, 0.000000000000008526512829121244),# Del nivel 22001 al 22500
        (23000, 0.000000000000004263256414560622),# Del nivel 22501 al 23000
        (23500, 0.000000000000002131628207280311),# Del nivel 23001 al 23500
        (24000, 0.0000000000000010658141036401555),# Del nivel 23501 al 24000
        (24500, 0.0000000000000005329070518200778),# Del nivel 24001 al 24500
        (25000, 0.0000000000000002664535259100389),# Del nivel 24501 al 25000
        (25500, 0.00000000000000013322676295501945),# Del nivel 25001 al 25500
        (26000, 0.00000000000000006661338147750972),# Del nivel 25501 al 26000
        (26500, 0.00000000000000003330669073875486),# Del nivel 26001 al 26500
        (27000, 0.00000000000000001665334536937743),# Del nivel 26501 al 27000
        (27500, 0.000000000000000008326672684688715),# Del nivel 27001 al 27500
        (28000, 0.0000000000000000041633363423443575),# Del nivel 27501 al 28000
        (28500, 0.0000000000000000020816681711721788),# Del nivel 28001 al 28500
        (29000, 0.0000000000000000010408340855860894),# Del nivel 28501 al 29000
        (29500, 0.0000000000000000005204170427930447),# Del nivel 29001 al 29500
        (30001, 0.00000000000000000026020852139652235)  # Del nivel 29501 al 30000
    ]

    current_level = 0
    for max_level, rate in xp_increments:
        for level in range(current_level, max_level):
            # Asegurarse de que los valores sean enteros y no crezcan indefinidamente
            levels.append({
                "level": level,
                "xpRequired": int(xp),
                "moneyReward": int(money),
                "xpMultiplier": round(xp_multiplier, 2)
            })
            
            # Incrementar XP y dinero de forma similar
            xp = int(xp + xp * rate)
            money = int(money + money * rate)  # Aquí multiplicamos por el mismo % que XP
            xp_multiplier = round(xp_multiplier + 0.01, 2)
            
        current_level = max_level
    
    return levels

# Generar niveles
levels = generate_levels()

# Guardar en un archivo JSON
with open("levels.json", "w") as f:
    json.dump(levels, f, indent=4)

print("Niveles generados y guardados en 'levels.json'.")
