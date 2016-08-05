Publishes GDB Files to a map service

project_name = transmission_2015
delivery_name = spring_30_delivery_#

python -u ingest.py stage_data file/path.gdb project_name delivery_name 
- copies the raw data into enterprise gdb grouped by delivery name

python -u ingest.py transform_data project_name delivery_name 
- processes the data to a standard format

python -u ingest.py publish_data project_name delivery_name
- adds the delivery to a map definition

python -u ingest.py publish_ms project_name delivery_name
- publishes the map to a map service

