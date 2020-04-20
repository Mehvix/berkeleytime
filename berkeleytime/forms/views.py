from __future__ import division
import re, os, sys, datetime
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from django.core.cache import cache
from django.db.models import Avg, Sum
from django.shortcuts import render_to_response
from django.template import RequestContext
from yaml import load, dump, CLoader as Loader, CDumper as Dumper

# Returns YAML file (in JSON format) with name
def get_config(request, config_name):
# YAML_PATH is the filepath to the yaml file
	try:
		file = open(yaml_path + ".yaml")
		loaded_yaml = load(file, Loader=Loader)
		return render_to_json(loaded_yaml)
	except FileNotFoundError:
		print("Error when trying to read file:", yaml_path, "ERROR: FileNoteFoundError")
	except:
		print("Unexpected error within check_yaml_format. Raised error:")
		raise