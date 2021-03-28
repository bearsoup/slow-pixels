# https://www.geeksforgeeks.org/convert-csv-to-json-using-python/

import csv
import json

def make_json(csvFilePath, jsonFilePath):
    jsonArray = []

    # open a cv reader called DictReaer
    with open(csvFilePath, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf)

        #convert each csv row into python dict
        for row in csvReader:
            obj = {
                "step": int(row['Step']),
                "duration": int(row['Duration']),
                "r": {
                    "freq": float(row['R freq']),
                    "note": row['R note']
                },
                "g": {
                    "freq": float(row['G freq']),
                    "note": row['G note']
                },
                "b": {
                    "freq": float(row['B freq']),
                    "note": row['B note']
                }
            }

            #add this python dict to json array
            jsonArray.append(obj)

    # Open a json writer, and use the json.dumps()
    # function to dump data
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(jsonArray, indent=4))

# Driver Code

csvFilePath = r'HomeFreqvalues01.csv'
jsonFilePath = r'home-freqs.json'

make_json(csvFilePath, jsonFilePath)