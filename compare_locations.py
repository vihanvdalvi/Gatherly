import re
import csv

# Extract nodes from campus.dot
with open('backend/graph/campus.dot', 'r') as f:
    dot_content = f.read()

# Find all locations (text in quotes before ->)
dot_nodes = set(re.findall(r'\"([^\"]+)\" ->', dot_content))

# Extract locations from nodes.csv
csv_locations = set()
with open('backend/graph/nodes.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # skip header
    for row in reader:
        if row:
            csv_locations.add(row[0].strip())

# Find missing
missing = sorted(dot_nodes - csv_locations)

print('MISSING FROM nodes.csv:')
print('=' * 60)
for loc in missing:
    print(f'- {loc}')

print(f'\n\nSummary:')
print(f'Total locations in campus.dot: {len(dot_nodes)}')
print(f'Total locations in nodes.csv: {len(csv_locations)}')
print(f'Missing from nodes.csv: {len(missing)}')
