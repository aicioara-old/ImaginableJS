<?php


move_uploaded_file( $_FILES['new_picture']['tmp_name'], "./image.jpg" );
echo("<img src='image.jpg'>");


