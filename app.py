# Copyright 2024 <Votre nom et code permanent>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


from flask import Flask, request, jsonify, render_template, g
from .database import Database

app = Flask(__name__, static_folder="static", static_url_path="/static")

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        g._database = Database()
    return g._database


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.disconnect()

# Front-end
@app.route('/')
def catch_all():
    return render_template('pages/index.jinja')

# Back-end
@app.route('/api/v1/animals', methods=['GET'])
def get_animals():
    query = request.args.get('q', default = '', type = str)
    limit = request.args.get('limit', default = 5, type = int)
    db = get_db()
    pets = []
    if query:
        pets = db.get_animal_search(query)
    else:
        pets = db.get_animal_random(limit)
    return jsonify(pets)

@app.route('/api/v1/animals/<int:animal_id>', methods=['GET'])
def get_animal(animal_id):
    db = get_db()
    animal = db.get_animal(animal_id)
    return jsonify(animal)