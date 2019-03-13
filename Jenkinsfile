pipeline {
  agent {
    docker {
      image 'jekyll/builder'
    }

  }
  stages {
    stage('Dependencies') {
      steps {
        sh 'bundle install'
      }
    }
    stage('Build') {
      steps {
        sh 'bash script/cibuild'
      }
    }
  }
}